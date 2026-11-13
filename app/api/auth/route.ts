import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import firebaseConfig from '../../../firebase-applet-config.json';
import {
  getOrCreateUser,
  getUserByEmail,
  updateUserPassword,
  touchWorkspaceSync,
} from '@/src/db/queries';
import { notifySync } from '@/lib/syncNotifier';

async function verifyFirebaseTokenWithFallback(idToken: string): Promise<{
  uid: string;
  email?: string;
  name?: string;
} | null> {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (adminErr) {
    // Fallback to Firebase Auth REST lookup if server lacks ADC service account
    try {
      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      if (!resp.ok) return null;
      const json = await resp.json();
      const fbUser = json?.users?.[0];
      if (!fbUser?.email) return null;
      return {
        uid: fbUser.localId || fbUser.email,
        email: fbUser.email,
        name: fbUser.displayName,
      };
    } catch {
      console.warn('Firebase token verification failed:', adminErr);
      return null;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));
    const { action, email, password, name, phone, workshopName, workshopAddress } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. Autenticação via Firebase ID Token (Google OAuth)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const verified = await verifyFirebaseTokenWithFallback(idToken);
      if (!verified || !verified.email) {
        return NextResponse.json(
          { error: 'Token Google inválido ou expirado. Tente entrar novamente.' },
          { status: 401 }
        );
      }

      const tokenEmail = verified.email.trim().toLowerCase();
      const user = await getOrCreateUser({
        uid: tokenEmail,
        email: tokenEmail,
        name: (verified.name || name || 'JL Automotive').trim(),
        phone: phone ? phone.trim() : undefined,
        workshopName: workshopName ? workshopName.trim() : undefined,
        workshopAddress: workshopAddress ? workshopAddress.trim() : undefined,
      });
      return NextResponse.json({ success: true, user });
    }

    // 2. Esqueci minha Senha / Recuperar Credencial
    if (action === 'forgot-password' || action === 'recover-password') {
      if (!cleanEmail) {
        return NextResponse.json(
          { error: 'Por favor, informe seu e-mail para recuperar o acesso.' },
          { status: 400 }
        );
      }

      const user = await getUserByEmail(cleanEmail);
      if (!user) {
        return NextResponse.json(
          {
            error:
              'Nenhuma conta encontrada com este e-mail. Verifique o endereço digitado ou cadastre-se clicando em "Primeiro Acesso".',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          uid: user.uid,
          email: user.email,
          name: user.name,
          phone: user.phone,
          password: user.password,
          workshopName: user.workshopName,
        },
      });
    }

    // 3. Redefinir Senha
    if (action === 'reset-password') {
      if (!cleanEmail || !cleanPassword) {
        return NextResponse.json(
          { error: 'E-mail e nova senha são obrigatórios.' },
          { status: 400 }
        );
      }

      const user = await getUserByEmail(cleanEmail);
      if (!user) {
        return NextResponse.json(
          { error: 'Conta não encontrada para redefinição de senha.' },
          { status: 404 }
        );
      }

      const updated = await updateUserPassword(cleanEmail, cleanPassword);
      await touchWorkspaceSync(cleanEmail);
      notifySync(cleanEmail);

      return NextResponse.json({
        success: true,
        message: 'Senha alterada com sucesso!',
        user: updated,
      });
    }

    // 4. Registro / Primeiro Acesso
    if (action === 'register' || action === 'first-access') {
      if (!cleanEmail || !cleanPassword) {
        return NextResponse.json(
          { error: 'E-mail e senha são obrigatórios para cadastro.' },
          { status: 400 }
        );
      }

      const existing = await getUserByEmail(cleanEmail);
      if (existing) {
        return NextResponse.json(
          {
            error:
              'Este e-mail já está cadastrado no sistema. Use "Entrar" para acessar sua conta ou "Esqueci minha Senha".',
          },
          { status: 409 }
        );
      }

      const user = await getOrCreateUser({
        uid: cleanEmail,
        email: cleanEmail,
        name: (name || 'JL Automotive').trim(),
        phone: (phone || '').trim(),
        workshopName: (workshopName || 'JL Automotive - Funilaria & Pintura').trim(),
        workshopAddress: workshopAddress ? workshopAddress.trim() : '',
        password: cleanPassword,
      });

      return NextResponse.json({ success: true, user });
    }

    // 5. Login
    if (action === 'login') {
      if (!cleanEmail || !cleanPassword) {
        return NextResponse.json(
          { error: 'E-mail e senha são obrigatórios para entrar.' },
          { status: 400 }
        );
      }

      const user = await getUserByEmail(cleanEmail);
      if (!user) {
        return NextResponse.json(
          {
            error:
              'E-mail não encontrado no sistema. Verifique o e-mail digitado ou cadastre-se em "Primeiro Acesso".',
          },
          { status: 401 }
        );
      }

      const storedPassword = (user.password || '').trim();
      if (!storedPassword || storedPassword !== cleanPassword) {
        return NextResponse.json(
          {
            error:
              'Senha incorreta para esta conta. Verifique a senha digitada ou consulte sua senha em "Esqueci minha Senha".',
          },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true, user });
    }

    // 6. Atualização de Perfil
    if (action === 'update-profile') {
      if (!cleanEmail) {
        return NextResponse.json(
          { error: 'E-mail da conta é obrigatório para atualizar o perfil.' },
          { status: 400 }
        );
      }

      const user = await getOrCreateUser({
        uid: cleanEmail,
        email: cleanEmail,
        name,
        phone,
        workshopName,
        workshopAddress,
        password: cleanPassword || undefined,
      });

      await touchWorkspaceSync(cleanEmail);
      notifySync(cleanEmail);

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Ação não suportada.' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/auth error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro no servidor de autenticação.' },
      { status: 500 }
    );
  }
}
