import { Budget, Client, FinancialTransaction, UserProfile, CalendarEvent, VehicleChecklist } from './types';
import { AuthSession } from './storage';
import { auth, googleAuthProvider } from '@/src/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export interface FullAppData {
  user?: any;
  profile?: UserProfile;
  budgets?: Budget[];
  clients?: Client[];
  transactions?: FinancialTransaction[];
  events?: CalendarEvent[];
  checklists?: VehicleChecklist[];
}

// Sincroniza todos os dados do usuário para o banco de dados Cloud SQL (PostgreSQL)
export async function syncDataToCloud(
  userId: string,
  data: FullAppData
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...data,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson.error || 'Falha ao sincronizar' };
    }

    const resJson = await res.json();
    return { success: true };
  } catch (err: any) {
    console.error('Erro de sincronização com o banco de dados:', err);
    return { success: false, error: err?.message || 'Erro de conexão' };
  }
}

// Baixa os dados salvos no banco de dados para a conta do usuário
export async function fetchCloudData(userId: string): Promise<FullAppData | null> {
  try {
    const res = await fetch(`/api/sync?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as FullAppData;
    }
    return null;
  } catch (err) {
    console.error('Erro ao buscar dados na nuvem:', err);
    return null;
  }
}

// Login ou Registro de Usuário no Banco de Dados
export async function authenticateWithDb(payload: {
  action:
    | 'login'
    | 'register'
    | 'update-profile'
    | 'forgot-password'
    | 'recover-password'
    | 'reset-password'
    | 'first-access';
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  workshopName?: string;
  workshopAddress?: string;
  uid?: string;
}): Promise<{ success: boolean; user?: any; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Erro na autenticação' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro de rede' };
  }
}

// Login com Conta Google (OAuth + Cloud SQL Sync)
export async function signInWithGoogleOAuth(): Promise<{
  success: boolean;
  session?: AuthSession;
  error?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    // Sincroniza a conta do usuário no banco de dados Cloud SQL
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        action: 'login',
        email: user.email,
        name: user.displayName || 'JL Automotive',
        phone: user.phoneNumber || '(44) 99937-0049',
      }),
    });

    const data = await res.json().catch(() => ({}));

    const session: AuthSession = {
      email: user.email || 'usuario@jlautomotive.com',
      name: user.displayName || 'JL Automotive',
      loggedInAt: new Date().toISOString(),
    };

    return { success: true, session };
  } catch (err: any) {
    console.error('Google Sign-In error:', err);
    return {
      success: false,
      error: err?.message || 'Não foi possível concluir o login com o Google.',
    };
  }
}
