import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getOrCreateUser, getUserByEmail, updateUserPassword } from '@/src/db/queries';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));
    const { action, email, password, name, phone, workshopName, workshopAddress } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. Caso autenticado via Firebase ID Token (Google OAuth)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        const user = await getOrCreateUser({
          uid: decoded.uid,
          email: (decoded.email || cleanEmail || 'usuario@jlautomotive.com').trim().toLowerCase(),
          name: (decoded.name || name || 'JL Automotive').trim(),
          phone: (phone || '(44) 99937-0049').trim(),
          workshopName: (workshopName || 'JL Automotive - Funilaria & Pintura').trim(),
          workshopAddress: workshopAddress ? workshopAddress.trim() : undefined,
        });
        return NextResponse.json({ success: true, user });
      } catch (tokenErr) {
        console.warn('Firebase token verification error, falling back:', tokenErr);
      }
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

      const uid = cleanEmail;
      const user = await getOrCreateUser({
        uid,
        email: cleanEmail,
        name: (name || 'JL Automotive').trim(),
        phone: (phone || '(44) 99937-0049').trim(),
        workshopName: (workshopName || 'JL Automotive - Funilaria & Pintura').trim(),
        workshopAddress: workshopAddress ? workshopAddress.trim() : undefined,
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
        // Se usuário ainda não existe mas é uma conta inicial padrão
        if (
          cleanEmail === 'jl.automotive@gmail.com' ||
          cleanEmail === 'renatof.rcc@gmail.com'
        ) {
          const uid = cleanEmail;
          const newUser = await getOrCreateUser({
            uid,
            email: cleanEmail,
            name: (name || 'JL Automotive').trim(),
            phone: (phone || '(44) 99937-0049').trim(),
            workshopName: 'JL Automotive - Funilaria & Pintura',
            password: cleanPassword,
          });
          return NextResponse.json({ success: true, user: newUser });
        }

        return NextResponse.json(
          {
            error:
              'E-mail não encontrado no sistema. Verifique o e-mail digitado ou cadastre-se em "Primeiro Acesso".',
          },
          { status: 401 }
        );
      }

      const storedPassword = (user.password || '').trim();
      if (storedPassword && storedPassword !== cleanPassword) {
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
      const targetUid = cleanEmail || body.uid || 'default_user';
      const user = await getOrCreateUser({
        uid: targetUid,
        email: cleanEmail || 'jl.automotive@gmail.com',
        name,
        phone,
        workshopName,
        workshopAddress,
        password: cleanPassword,
      });
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
