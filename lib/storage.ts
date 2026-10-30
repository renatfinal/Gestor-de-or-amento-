import { Budget, Client, FinancialTransaction, UserProfile, ThemeMode } from './types';
import { saveBudgetsToIndexedDb, getBudgetsFromIndexedDb } from './imageStorage';

const STORAGE_KEYS = {
  BUDGETS: 'jl_automotive_budgets_v1',
  CLIENTS: 'jl_automotive_clients_v1',
  TRANSACTIONS: 'jl_automotive_transactions_v1',
  PROFILE: 'jl_automotive_profile_v1',
  THEME: 'jl_automotive_theme_v1',
};

const LEGACY_STORAGE_KEYS = {
  BUDGETS: 'jm_funilaria_budgets_v1',
  CLIENTS: 'jm_funilaria_clients_v1',
  TRANSACTIONS: 'jm_funilaria_transactions_v1',
  PROFILE: 'jm_funilaria_profile_v1',
  THEME: 'jm_funilaria_theme_v1',
};

// Seed initial clients
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'Ana Carolina Ribeiro',
    phone: '(11) 98765-4321',
    email: 'anacarol.ribeiro@gmail.com',
    lastVehicle: 'Jeep Compass 2022',
    totalBudgetsCount: 1,
    notes: 'Cliente indicou serviço de retoque no para-lama.',
    createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'c-2',
    name: 'Carlos Eduardo Santos',
    phone: '(11) 97654-3210',
    email: 'carlos.santos@outlook.com',
    lastVehicle: 'Volkswagen Polo 1.0 TSI 2021',
    totalBudgetsCount: 1,
    notes: 'Pintura completa das duas portas laterais.',
    createdAt: '2026-10-05T14:30:00.000Z',
  },
  {
    id: 'c-3',
    name: 'Fernando Augusto Lima',
    phone: '(11) 96543-2109',
    email: 'fernando.lima@empresa.com.br',
    lastVehicle: 'Toyota Corolla Cross 2023',
    totalBudgetsCount: 1,
    notes: 'Polimento cristalizado e recuperação do para-choque.',
    createdAt: '2026-10-18T09:15:00.000Z',
  },
  {
    id: 'c-4',
    name: 'Mariana Duarte Souza',
    phone: '(11) 95432-1098',
    email: 'mari.duarte@hotmail.com',
    lastVehicle: 'Honda HR-V 2020',
    totalBudgetsCount: 1,
    notes: 'Recuperação de capô com granizo.',
    createdAt: '2026-10-22T11:45:00.000Z',
  },
  {
    id: 'c-5',
    name: 'Rodrigo Medeiros Barbosa',
    phone: '(11) 94321-0987',
    email: 'rodrigo.medeiros@gmail.com',
    lastVehicle: 'Chevrolet Tracker 2022',
    totalBudgetsCount: 1,
    notes: 'Pintura do teto preto black piano.',
    createdAt: '2026-10-28T16:00:00.000Z',
  },
];

// Seed initial budgets
const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-101',
    clientName: 'Ana Carolina Ribeiro',
    phone: '(11) 98765-4321',
    vehicleModel: 'Jeep Compass Limited',
    plate: 'RBD4E29',
    manufactureYear: '2022',
    vehicleColor: 'Cinza Granito Perolizado',
    serviceDescription: 'Funilaria e pintura do para-lama dianteiro direito e retoque no para-choque com tinta perolizada.',
    notes: 'Prazo urgente para viagem de fim de semana.',
    amount: 1450.0,
    formattedAmount: '1.450,00',
    deadlineDate: '05/11/2026',
    status: 'Em Execução',
    photos: [
      {
        id: 'p-1',
        dataUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
        caption: 'Arranhão no para-lama dianteiro',
        createdAt: '2026-10-25T10:00:00.000Z',
      },
    ],
    createdAt: '2026-10-25T10:00:00.000Z',
  },
  {
    id: 'b-102',
    clientName: 'Carlos Eduardo Santos',
    phone: '(11) 97654-3210',
    vehicleModel: 'Volkswagen Polo 1.0 TSI',
    plate: 'FXS9182',
    manufactureYear: '2021',
    vehicleColor: 'Branco Cristal',
    serviceDescription: 'Desamassamento e pintura da lateral traseira esquerda + alinhamento de porta.',
    notes: 'Peça original mantida, aplicar verniz alto sólidos.',
    amount: 2200.0,
    formattedAmount: '2.200,00',
    deadlineDate: '10/11/2026',
    status: 'Aprovado',
    photos: [],
    createdAt: '2026-10-27T14:30:00.000Z',
  },
  {
    id: 'b-103',
    clientName: 'Fernando Augusto Lima',
    phone: '(11) 96543-2109',
    vehicleModel: 'Toyota Corolla Cross',
    plate: 'GHT3A77',
    manufactureYear: '2023',
    vehicleColor: 'Prata Metálico',
    serviceDescription: 'Martelinho de ouro no capô e pintura técnica do para-choque dianteiro.',
    notes: 'Veículo com proteção cerâmica prévia.',
    amount: 1850.0,
    formattedAmount: '1.850,00',
    deadlineDate: '29/10/2026',
    status: 'Concluído',
    photos: [],
    createdAt: '2026-10-20T09:15:00.000Z',
  },
];

// Seed initial transactions for 2026 across several months
const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  // Outubro 2026
  {
    id: 't-1',
    type: 'entrada',
    description: 'Sinal 50% - Pintura Jeep Compass (Ana Carolina)',
    category: 'Orçamento Automotivo',
    amount: 725.0,
    formattedAmount: '725,00',
    date: '2026-10-25',
    isPaid: true,
    paymentMethod: 'PIX',
    budgetId: 'b-101',
    clientName: 'Ana Carolina Ribeiro',
    createdAt: '2026-10-25T10:05:00.000Z',
  },
  {
    id: 't-2',
    type: 'entrada',
    description: 'Pagamento Integral - Toyota Corolla (Fernando Lima)',
    category: 'Orçamento Automotivo',
    amount: 1850.0,
    formattedAmount: '1.850,00',
    date: '2026-10-29',
    isPaid: true,
    paymentMethod: 'Cartão de Crédito',
    budgetId: 'b-103',
    clientName: 'Fernando Augusto Lima',
    createdAt: '2026-10-29T11:00:00.000Z',
  },
  {
    id: 't-3',
    type: 'entrada',
    description: 'Polimento Faróis e Cristalização (Avulso)',
    category: 'Estética Automotiva',
    amount: 450.0,
    formattedAmount: '450,00',
    date: '2026-10-15',
    isPaid: true,
    paymentMethod: 'Dinheiro',
    createdAt: '2026-10-15T16:00:00.000Z',
  },
  {
    id: 't-4',
    type: 'saida',
    description: 'Tintas PPG, Verniz Alto Sólidos e Catalisador',
    category: 'Materiais & Tintas',
    amount: 680.0,
    formattedAmount: '680,00',
    date: '2026-10-18',
    isPaid: true,
    createdAt: '2026-10-18T14:00:00.000Z',
  },
  {
    id: 't-5',
    type: 'saida',
    description: 'Lixas d’água 1200/2000/3000 e Fitas de Mascaramento 3M',
    category: 'Insumos de Funilaria',
    amount: 220.0,
    formattedAmount: '220,00',
    date: '2026-10-20',
    isPaid: true,
    createdAt: '2026-10-20T09:30:00.000Z',
  },
  {
    id: 't-6',
    type: 'saida',
    description: 'Conta de Energia da Cabine de Pintura (Enel)',
    category: 'Despesas Fixas',
    amount: 850.0,
    formattedAmount: '850,00',
    date: '2026-10-29',
    isPaid: false, // Saldo Devedor!
    createdAt: '2026-10-29T08:00:00.000Z',
  },
  // Setembro 2026
  {
    id: 't-7',
    type: 'entrada',
    description: 'Pintura Completa Fiat Toro',
    category: 'Orçamento Automotivo',
    amount: 3800.0,
    formattedAmount: '3.800,00',
    date: '2026-09-12',
    isPaid: true,
    paymentMethod: 'PIX',
    createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 't-8',
    type: 'saida',
    description: 'Aluguel do Galpão da Oficina',
    category: 'Despesas Fixas',
    amount: 2100.0,
    formattedAmount: '2.100,00',
    date: '2026-09-10',
    isPaid: true,
    createdAt: '2026-09-10T09:00:00.000Z',
  },
  // Agosto 2026
  {
    id: 't-9',
    type: 'entrada',
    description: 'Reparação Para-choque e Grade Hyundai HB20',
    category: 'Orçamento Automotivo',
    amount: 1600.0,
    formattedAmount: '1.600,00',
    date: '2026-08-14',
    isPaid: true,
    paymentMethod: 'Cartão de Débito',
    createdAt: '2026-08-14T11:00:00.000Z',
  },
  {
    id: 't-10',
    type: 'saida',
    description: 'Manutenção Compressor de Ar e Filtros de Cabine',
    category: 'Manutenção de Equipamentos',
    amount: 540.0,
    formattedAmount: '540,00',
    date: '2026-08-20',
    isPaid: true,
    createdAt: '2026-08-20T15:00:00.000Z',
  },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'JL Automotive',
  phone: '(44) 99937-0049',
  email: 'jl.automotive@gmail.com',
  password: 'admin',
  workshopName: 'JL Automotive - Funilaria & Pintura',
  workshopAddress: 'Rua Guilherme Naimann 198, Jardim Bandeirantes - CEP: 87308-410 - Campo Mourão - PR',
};

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark-spring';
  const saved = (localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem(LEGACY_STORAGE_KEYS.THEME)) as ThemeMode | null;
  return saved || 'dark-spring';
}

export function saveStoredTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function getStoredBudgets(): Budget[] {
  if (typeof window === 'undefined') return INITIAL_BUDGETS;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.BUDGETS) || localStorage.getItem(LEGACY_STORAGE_KEYS.BUDGETS);
    if (!item) {
      try {
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
      } catch (e) {
        console.warn('Could not seed initial budgets to localStorage:', e);
      }
      return INITIAL_BUDGETS;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error('Error reading budgets:', err);
    return INITIAL_BUDGETS;
  }
}

export function saveStoredBudgets(budgets: Budget[]) {
  if (typeof window === 'undefined') return;

  // Persist to IndexedDB asynchronously (no 5MB quota limit)
  saveBudgetsToIndexedDb(budgets).catch((e) => {
    console.warn('IndexedDB budget sync error:', e);
  });

  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (err: unknown) {
    console.warn('Quota exceeded in localStorage. Creating optimized lightweight storage copy...', err);
    try {
      // If quota exceeded, strip or compress inline dataUrls in localStorage
      // Keep metadata while full photos are preserved in IndexedDB and in-memory React state
      const lightweightBudgets = budgets.map((b) => ({
        ...b,
        photos: (b.photos || []).map((p, idx) => ({
          ...p,
          // Only keep dataUrl if under 40KB and only the first 2 photos
          dataUrl: idx < 2 && p.dataUrl && p.dataUrl.length < 50000 ? p.dataUrl : '',
        })),
      }));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(lightweightBudgets));
    } catch (fallbackErr) {
      console.warn('Secondary localStorage fallback:', fallbackErr);
      try {
        // Ultimate fallback: save budgets with empty photos array in localStorage
        const noPhotosBudgets = budgets.map((b) => ({
          ...b,
          photos: (b.photos || []).map((p) => ({
            id: p.id,
            caption: p.caption,
            createdAt: p.createdAt,
            dataUrl: '',
          })),
        }));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(noPhotosBudgets));
      } catch (finalErr) {
        console.warn('Final localStorage attempt failed, but IndexedDB holds the data:', finalErr);
      }
    }
  }
}

export function getStoredClients(): Client[] {
  if (typeof window === 'undefined') return INITIAL_CLIENTS;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CLIENTS) || localStorage.getItem(LEGACY_STORAGE_KEYS.CLIENTS);
    if (!item) {
      // Sort alphabetically A-Z
      const sorted = [...INITIAL_CLIENTS].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR')
      );
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(sorted));
      return sorted;
    }
    const clients: Client[] = JSON.parse(item);
    return clients.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  } catch (err) {
    console.error('Error reading clients:', err);
    return INITIAL_CLIENTS;
  }
}

export function saveStoredClients(clients: Client[]) {
  if (typeof window === 'undefined') return;
  try {
    const sorted = [...clients].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(sorted));
  } catch (err) {
    console.error('Error saving clients:', err);
  }
}

export function getStoredTransactions(): FinancialTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || localStorage.getItem(LEGACY_STORAGE_KEYS.TRANSACTIONS);
    if (!item) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error('Error reading transactions:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: FinancialTransaction[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions:', err);
  }
}

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_PROFILE;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.PROFILE) || localStorage.getItem(LEGACY_STORAGE_KEYS.PROFILE);
    if (!item) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    const parsed: UserProfile = JSON.parse(item);
    // Automatically modernize workshop name and details if still holding legacy defaults
    let updated = false;
    if (parsed.workshopName && /JM Funilaria/i.test(parsed.workshopName)) {
      parsed.workshopName = parsed.workshopName.replace(/JM Funilaria/gi, 'JL Automotive');
      updated = true;
    }
    if (parsed.email && parsed.email.includes('jm.funilaria')) {
      parsed.email = 'jl.automotive@gmail.com';
      updated = true;
    }
    if (parsed.workshopAddress && parsed.workshopAddress.includes('Av. das Oficinas')) {
      parsed.workshopAddress = 'Rua Guilherme Naimann 198, Jardim Bandeirantes - CEP: 87308-410 - Campo Mourão - PR';
      updated = true;
    }
    if (parsed.phone === '(11) 99876-5432') {
      parsed.phone = '(44) 99937-0049';
      updated = true;
    }
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Error reading profile:', err);
    return INITIAL_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile:', err);
  }
}
