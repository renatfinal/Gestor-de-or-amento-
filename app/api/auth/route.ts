import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getOrCreateUser, getUserByEmail } from '@/src/db/queries';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));
    const { action, email, password, name, phone, workshopName, workshopAddress } = body;

    // 1. Caso autenticado via Firebase ID Token (Google OAuth)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        const user = await getOrCreateUser({
          uid: decoded.uid,
          email: decoded.email || email || 'usuario@jlautomotive.com',
          name: decoded.name || name || 'JL Automotive',
          phone: phone || '(44) 99937-0049',
          workshopName: workshopName || 'JL Automotive - Funilaria & Pintura',
          workshopAddress: workshopAddress,
        });
        return NextResponse.json({ success: true, user });
      } catch (tokenErr) {
        console.warn('Firebase token verification error, falling back:', tokenErr);
      }
    }

    // 2. Registro ou Login com Email e Senha
    if (action === 'register') {
      if (!email || !password) {
        return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
      }
      const existing = await getUserByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
      }
      const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const user = await getOrCreateUser({
        uid,
        email,
        name: name || 'JL Automotive',
        phone: phone || '(44) 99937-0049',
        workshopName: workshopName || 'JL Automotive - Funilaria & Pintura',
        workshopAddress: workshopAddress,
        password,
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
      }
      const user = await getUserByEmail(email);
      if (!user) {
        // Se usuário ainda não existe no Postgres mas é a conta inicial padrão do sistema
        if (
          email.toLowerCase() === 'jl.automotive@gmail.com' ||
          email.toLowerCase() === 'renatof.rcc@gmail.com'
        ) {
          const uid = `usr_${Date.now()}`;
          const newUser = await getOrCreateUser({
            uid,
            email,
            name: name || 'JL Automotive',
            phone: phone || '(44) 99937-0049',
            workshopName: 'JL Automotive - Funilaria & Pintura',
            password,
          });
          return NextResponse.json({ success: true, user: newUser });
        }
        return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
      }

      if (user.password && user.password !== password) {
        return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
      }

      return NextResponse.json({ success: true, user });
    }

    if (action === 'update-profile') {
      const targetUid = body.uid || `usr_${email}`;
      const user = await getOrCreateUser({
        uid: targetUid,
        email: email || 'jl.automotive@gmail.com',
        name,
        phone,
        workshopName,
        workshopAddress,
        password,
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
