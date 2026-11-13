'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FilePlus,
  ArrowDownLeft,
  ArrowUpRight,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ActiveTab,
  Budget,
  Client,
  FinancialTransaction,
  ThemeMode,
  TransactionType,
  UserProfile,
  CalendarEvent,
  VehicleChecklist,
} from '@/lib/types';
import {
  getStoredBudgets,
  getStoredClients,
  getStoredProfile,
  getStoredTheme,
  getStoredTransactions,
  getStoredSession,
  saveStoredSession,
  AuthSession,
  saveStoredBudgets,
  saveStoredClients,
  saveStoredProfile,
  saveStoredTheme,
  saveStoredTransactions,
  getStoredEvents,
  saveStoredEvents,
  getStoredChecklists,
  saveStoredChecklists,
  clearAllStoredUserData,
  INITIAL_PROFILE,
} from '@/lib/storage';
import {
  syncDataToCloud,
  fetchCloudData,
  subscribeToLiveSync,
  checkSyncVersion,
} from '@/lib/cloudSync';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CalendarView } from '@/components/CalendarView';
import { BudgetModal } from '@/components/BudgetModal';
import { ExistingBudgetsModal } from '@/components/ExistingBudgetsModal';
import { ClientsView } from '@/components/ClientsView';
import { FinancialView } from '@/components/FinancialView';
import { BalanceteView } from '@/components/BalanceteView';
import { ProfileModal } from '@/components/ProfileModal';
import { LoginPage } from '@/components/LoginPage';
import { DatabaseTablesModal } from '@/components/DatabaseTablesModal';
import { EventModal } from '@/components/EventModal';

export default function HomePage() {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Theme: 'light-spring' (Claro com Fundo Cinza Claro & Verde Primavera) | 'dark-spring' (Preto com Verde Primavera)
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');

  // Core Data with lazy initializers
  const [budgets, setBudgets] = useState<Budget[]>(() => getStoredBudgets());
  const [clients, setClients] = useState<Client[]>(() => getStoredClients());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => getStoredTransactions());
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [events, setEvents] = useState<CalendarEvent[]>(() => getStoredEvents());
  const [checklists, setChecklists] = useState<VehicleChecklist[]>(() => getStoredChecklists());

  // Database & Sync state
  const [isDatabaseTablesModalOpen, setIsDatabaseTablesModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExistingBudgetsModalOpen, setIsExistingBudgetsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [presetBudgetDate, setPresetBudgetDate] = useState<string | undefined>(undefined);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFirstAccessModalOpen, setIsFirstAccessModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [presetEventDate, setPresetEventDate] = useState<string | undefined>(undefined);

  // Authentication Session
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  // Refs to avoid effect teardown / stale version tracking
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  const lastKnownVersionRef = useRef<number>(0);

  // Success / error toast message
  const [toastState, setToastState] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = useCallback((msg: string, isError: boolean = false) => {
    setToastState({ message: msg, isError });
    setTimeout(() => {
      setToastState(null);
    }, 3600);
  }, []);

  // Targeted real-time automatic Cloud SQL synchronization
  const triggerCloudSync = async (overrides: {
    budgets?: Budget[];
    clients?: Client[];
    transactions?: FinancialTransaction[];
    events?: CalendarEvent[];
    checklists?: VehicleChecklist[];
    profile?: UserProfile;
    deletedItem?: {
      type: 'transaction' | 'budget' | 'client' | 'event' | 'checklist';
      id: string;
    };
    targetEmail?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const userEmail = (overrides.targetEmail || session?.email || '').trim().toLowerCase();
    if (!userEmail) {
      return { success: false, error: 'Sessão não autenticada. Entre com seu e-mail e senha.' };
    }

    setIsSyncing(true);
    try {
      const payload: Parameters<typeof syncDataToCloud>[1] = {};
      if (overrides.budgets !== undefined) payload.budgets = overrides.budgets;
      if (overrides.clients !== undefined) payload.clients = overrides.clients;
      if (overrides.transactions !== undefined) payload.transactions = overrides.transactions;
      if (overrides.events !== undefined) payload.events = overrides.events;
      if (overrides.checklists !== undefined) payload.checklists = overrides.checklists;
      if (overrides.profile !== undefined) payload.profile = overrides.profile;
      if (overrides.deletedItem !== undefined) payload.deletedItem = overrides.deletedItem;

      const res = await syncDataToCloud(userEmail, payload);
      if (res.success) {
        setLastSyncTime(new Date());
      }
      return res;
    } catch (e: any) {
      console.warn('Real-time sync to Cloud SQL error:', e);
      return { success: false, error: e?.message || 'Erro de conexão com o banco de dados.' };
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    clearAllStoredUserData();
    lastKnownVersionRef.current = 0;
    setSession(null);
    setBudgets([]);
    setClients([]);
    setTransactions([]);
    setEvents([]);
    setChecklists([]);
    setProfile(INITIAL_PROFILE);
    showToast('Sessão encerrada com sucesso.');
  };

  const [presetFinancialDate, setPresetFinancialDate] = useState<string | undefined>(undefined);
  const [presetFinancialType, setPresetFinancialType] = useState<TransactionType | undefined>(
    undefined
  );

  const handleOpenBudgetToEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsBudgetModalOpen(true);
  };

  // Update HTML class when theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark-spring') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Função central para buscar e atualizar todos os dados da conta autenticada na nuvem
  const refreshDataFromCloud = useCallback(
    async (notify: boolean = false, forceEmail?: string) => {
      const targetEmail = (forceEmail || session?.email || '').trim().toLowerCase();
      if (!targetEmail) return;

      try {
        const cloudData = await fetchCloudData(targetEmail);
        if (cloudData) {
          if (cloudData.user) {
            const prev = profileRef.current;
            const syncedProfile: UserProfile = {
              name: cloudData.user.name || prev.name || '',
              phone: cloudData.user.phone || prev.phone || '',
              email: (cloudData.user.email || targetEmail).trim().toLowerCase(),
              password: cloudData.user.password || prev.password || '',
              workshopName:
                cloudData.user.workshopName ||
                prev.workshopName ||
                'JL Automotive & Pintura Automotiva',
              workshopAddress: cloudData.user.workshopAddress ?? prev.workshopAddress ?? '',
            };
            setProfile(syncedProfile);
            saveStoredProfile(syncedProfile);
          }
          if (Array.isArray(cloudData.budgets)) {
            setBudgets(cloudData.budgets);
            saveStoredBudgets(cloudData.budgets);
          }
          if (Array.isArray(cloudData.clients)) {
            setClients(cloudData.clients);
            saveStoredClients(cloudData.clients);
          }
          if (Array.isArray(cloudData.transactions)) {
            setTransactions(cloudData.transactions);
            saveStoredTransactions(cloudData.transactions);
          }
          if (Array.isArray(cloudData.events)) {
            setEvents(cloudData.events);
            saveStoredEvents(cloudData.events);
          }
          if (Array.isArray(cloudData.checklists)) {
            setChecklists(cloudData.checklists);
            saveStoredChecklists(cloudData.checklists);
          }
          setLastSyncTime(new Date());
          if (notify) {
            showToast('Dados sincronizados com a nuvem em tempo real!');
          }
        }
      } catch (err) {
        console.warn('Real-time cloud refresh notice:', err);
      }
    },
    [session?.email, showToast]
  );

  // Sincronização em tempo real entre dispositivos: SOMENTE quando há sessão autenticada!
  useEffect(() => {
    const targetEmail = (session?.email || '').trim().toLowerCase();
    if (!targetEmail) return;

    // 1. Carga inicial dos dados da conta autenticada
    const initTimer = setTimeout(() => {
      refreshDataFromCloud(false, targetEmail);
    }, 0);

    // 2. Ouvinte em tempo real via Server-Sent Events (SSE)
    const unsubscribe = subscribeToLiveSync(targetEmail, () => {
      refreshDataFromCloud(false, targetEmail);
    });

    // 3. Polling de versão a cada 2.0 segundos (verificando timestamp persistido no PostgreSQL)
    const intervalId = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const ver = await checkSyncVersion(targetEmail);
        if (ver > 0 && ver !== lastKnownVersionRef.current) {
          lastKnownVersionRef.current = ver;
          refreshDataFromCloud(false, targetEmail);
        }
      }
    }, 2000);

    // 4. Sincronização imediata ao destravar a tela ou voltar para o navegador
    const handleActiveFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshDataFromCloud(false, targetEmail);
      }
    };

    window.addEventListener('focus', handleActiveFocus);
    document.addEventListener('visibilitychange', handleActiveFocus);

    return () => {
      clearTimeout(initTimer);
      unsubscribe();
      clearInterval(intervalId);
      window.removeEventListener('focus', handleActiveFocus);
      document.removeEventListener('visibilitychange', handleActiveFocus);
    };
  }, [session?.email, refreshDataFromCloud]);

  const handleToggleTheme = () => {
    const newTheme: ThemeMode = theme === 'dark-spring' ? 'light-spring' : 'dark-spring';
    setTheme(newTheme);
    saveStoredTheme(newTheme);
  };

  // Handle Saving Budget (envia apenas o orçamento e o cliente alterado para evitar sobrescrever dados de outros dispositivos)
  const handleSaveBudget = (budgetToSave: Budget) => {
    let updatedBudgets: Budget[];
    const exists = budgets.some((b) => b.id === budgetToSave.id);
    if (exists) {
      updatedBudgets = budgets.map((b) => (b.id === budgetToSave.id ? budgetToSave : b));
    } else {
      updatedBudgets = [budgetToSave, ...budgets];
    }
    setBudgets(updatedBudgets);
    saveStoredBudgets(updatedBudgets);

    let updatedClients = clients;
    let syncedClient: Client | undefined;

    if (budgetToSave.clientName && budgetToSave.clientName.trim()) {
      const trimmedName = budgetToSave.clientName.trim();
      const existingClientIndex = clients.findIndex(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingClientIndex >= 0) {
        updatedClients = clients.map((c, idx) => {
          if (idx === existingClientIndex) {
            syncedClient = {
              ...c,
              phone: budgetToSave.phone || c.phone,
              lastVehicle: budgetToSave.vehicleModel || c.lastVehicle,
              totalBudgetsCount: (c.totalBudgetsCount || 0) + (exists ? 0 : 1),
            };
            return syncedClient;
          }
          return c;
        });
      } else {
        syncedClient = {
          id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: trimmedName,
          phone: budgetToSave.phone || '',
          lastVehicle: budgetToSave.vehicleModel || '',
          totalBudgetsCount: 1,
          createdAt: new Date().toISOString(),
        };
        updatedClients = [...clients, syncedClient];
      }

      updatedClients.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      setClients(updatedClients);
      saveStoredClients(updatedClients);
    }

    triggerCloudSync({
      budgets: [budgetToSave],
      ...(syncedClient ? { clients: [syncedClient] } : {}),
    }).then((res) => {
      if (res.success) {
        showToast(`Orçamento para ${budgetToSave.clientName} salvo na nuvem!`);
      } else {
        showToast(res.error || 'Erro ao salvar orçamento no banco de dados.', true);
      }
    });
  };

  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    saveStoredBudgets(updated);
    triggerCloudSync({
      deletedItem: { type: 'budget', id },
    }).then((res) => {
      if (res.success) {
        showToast('Orçamento excluído com sucesso.');
      } else {
        showToast(res.error || 'Erro ao excluir orçamento no banco.', true);
      }
    });
  };

  // Clients management
  const handleSaveClient = (client: Client) => {
    let updated: Client[];
    const exists = clients.some((c) => c.id === client.id);
    if (exists) {
      updated = clients.map((c) => (c.id === client.id ? client : c));
    } else {
      updated = [...clients, client];
    }
    updated.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    setClients(updated);
    saveStoredClients(updated);
    triggerCloudSync({ clients: [client] }).then((res) => {
      if (res.success) {
        showToast(`Cliente ${client.name} salvo na nuvem!`);
      } else {
        showToast(res.error || 'Erro ao salvar cliente no banco.', true);
      }
    });
  };

  const handleDeleteClient = (clientId: string) => {
    const updated = clients.filter((c) => c.id !== clientId);
    setClients(updated);
    saveStoredClients(updated);
    triggerCloudSync({
      deletedItem: { type: 'client', id: clientId },
    }).then((res) => {
      if (res.success) {
        showToast('Cliente removido da lista.');
      } else {
        showToast(res.error || 'Erro ao excluir cliente no banco.', true);
      }
    });
  };

  // Financial transactions management
  const handleSaveTransaction = (tx: FinancialTransaction) => {
    let updated: FinancialTransaction[];
    const exists = transactions.some((t) => t.id === tx.id);
    if (exists) {
      updated = transactions.map((t) => (t.id === tx.id ? tx : t));
    } else {
      updated = [tx, ...transactions];
    }
    setTransactions(updated);
    saveStoredTransactions(updated);
    triggerCloudSync({ transactions: [tx] }).then((res) => {
      if (res.success) {
        showToast(`Lançamento de ${tx.type === 'entrada' ? 'Entrada' : 'Saída'} salvo na nuvem!`);
      } else {
        showToast(res.error || 'Erro ao salvar lançamento no banco.', true);
      }
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
    triggerCloudSync({
      deletedItem: { type: 'transaction', id },
    }).then((res) => {
      if (res.success) {
        showToast('Lançamento excluído com sucesso.');
      } else {
        showToast(res.error || 'Erro ao excluir lançamento no banco.', true);
      }
    });
  };

  // Profile save
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    if (session) {
      const updatedSession: AuthSession = {
        ...session,
        name: newProfile.name || session.name,
      };
      setSession(updatedSession);
      saveStoredSession(updatedSession);
    }
    showToast('Perfil atualizado na nuvem com sucesso!');
  };

  // Events & Notes management (returns Promise so callers verify DB persistence)
  const handleSaveEvent = async (
    event: CalendarEvent
  ): Promise<{ success: boolean; error?: string }> => {
    let updated: CalendarEvent[];
    const exists = events.some((e) => e.id === event.id);
    if (exists) {
      updated = events.map((e) => (e.id === event.id ? event : e));
    } else {
      updated = [event, ...events];
    }
    setEvents(updated);
    saveStoredEvents(updated);

    const res = await triggerCloudSync({ events: [event] });
    if (res.success) {
      showToast(`Evento/Nota "${event.title}" salvo no banco de dados!`);
    } else {
      showToast(res.error || 'Erro ao salvar evento no banco de dados.', true);
    }
    return res;
  };

  const handleDeleteEvent = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveStoredEvents(updated);

    const res = await triggerCloudSync({
      deletedItem: { type: 'event', id },
    });
    if (res.success) {
      showToast('Evento/Nota removido do banco de dados.');
    } else {
      showToast(res.error || 'Erro ao remover evento no banco de dados.', true);
    }
    return res;
  };

  // Checklists management
  const handleSaveChecklist = (chk: VehicleChecklist) => {
    let updated: VehicleChecklist[];
    const exists = checklists.some((c) => c.id === chk.id);
    if (exists) {
      updated = checklists.map((c) => (c.id === chk.id ? chk : c));
    } else {
      updated = [chk, ...checklists];
    }
    setChecklists(updated);
    saveStoredChecklists(updated);
    triggerCloudSync({ checklists: [chk] }).then((res) => {
      if (res.success) {
        showToast(`Check-list "${chk.title}" salvo no banco de dados!`);
      } else {
        showToast(res.error || 'Erro ao salvar check-list no banco.', true);
      }
    });
  };

  const handleDeleteChecklist = (id: string) => {
    const updated = checklists.filter((c) => c.id !== id);
    setChecklists(updated);
    saveStoredChecklists(updated);
    triggerCloudSync({
      deletedItem: { type: 'checklist', id },
    }).then((res) => {
      if (res.success) {
        showToast('Check-list removido.');
      } else {
        showToast(res.error || 'Erro ao remover check-list no banco.', true);
      }
    });
  };

  // Actions triggered from Calendar or Quick Buttons
  const handleOpenNewBudget = (datePreset?: string) => {
    setBudgetToEdit(null);
    setPresetBudgetDate(datePreset);
    setIsBudgetModalOpen(true);
  };

  const handleOpenFinancialEntry = (datePreset?: string) => {
    setPresetFinancialDate(datePreset);
    setPresetFinancialType('entrada');
    setActiveTab('financial');
  };

  const handleOpenFinancialExpense = (datePreset?: string) => {
    setPresetFinancialDate(datePreset);
    setPresetFinancialType('saida');
    setActiveTab('financial');
  };

  const handleNewBudgetForClient = (client: Client) => {
    const prefill: Budget = {
      id: `orc_${Date.now()}`,
      clientName: client.name,
      phone: client.phone,
      vehicleModel: client.lastVehicle || '',
      plate: '',
      manufactureYear: '',
      serviceDescription: '',
      notes: '',
      amount: 0,
      formattedAmount: '0,00',
      deadlineDate: '',
      status: 'Pendente',
      photos: [],
      createdAt: new Date().toISOString(),
    };
    setBudgetToEdit(prefill);
    setIsBudgetModalOpen(true);
  };

  const isLight = theme !== 'dark-spring';

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-sm tracking-wide">Carregando JL Automotive...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LoginPage
          theme={theme}
          onToggleTheme={handleToggleTheme}
          profile={profile}
          onLoginSuccess={async (newSession, userData) => {
            clearAllStoredUserData();
            lastKnownVersionRef.current = 0;
            setBudgets([]);
            setClients([]);
            setTransactions([]);
            setEvents([]);
            setChecklists([]);

            const cleanSession: AuthSession = {
              email: newSession.email.trim().toLowerCase(),
              name: userData?.name || newSession.name || 'JL Automotive',
              loggedInAt: newSession.loggedInAt,
            };
            setSession(cleanSession);
            saveStoredSession(cleanSession);

            if (userData) {
              const loadedProfile: UserProfile = {
                name: userData.name || cleanSession.name,
                phone: userData.phone || '',
                email: (userData.email || cleanSession.email).trim().toLowerCase(),
                password: userData.password || '',
                workshopName:
                  userData.workshopName || 'JL Automotive & Pintura Automotiva',
                workshopAddress: userData.workshopAddress || '',
              };
              setProfile(loadedProfile);
              saveStoredProfile(loadedProfile);
            }

            await refreshDataFromCloud(false, cleanSession.email);
            showToast(`Bem-vindo ao JL Automotive, ${userData?.name || cleanSession.name}!`);
          }}
          onOpenFirstAccess={() => setIsFirstAccessModalOpen(true)}
        />

        {/* Modal de Primeiro Acesso */}
        {isFirstAccessModalOpen && (
          <ProfileModal
            key="first-access-modal"
            isOpen={isFirstAccessModalOpen}
            profile={INITIAL_PROFILE}
            onSaveProfile={() => {}}
            onClose={() => setIsFirstAccessModalOpen(false)}
            theme={theme}
            isFirstAccess={true}
            onFirstAccessSuccess={async (updatedProfile) => {
              clearAllStoredUserData();
              lastKnownVersionRef.current = 0;
              setBudgets([]);
              setClients([]);
              setTransactions([]);
              setEvents([]);
              setChecklists([]);

              const cleanEmail = (updatedProfile.email || '').trim().toLowerCase();
              const newSession: AuthSession = {
                email: cleanEmail,
                name: updatedProfile.name || 'JL Automotive',
                loggedInAt: new Date().toISOString(),
              };
              setProfile(updatedProfile);
              saveStoredProfile(updatedProfile);
              setSession(newSession);
              saveStoredSession(newSession);

              await refreshDataFromCloud(false, cleanEmail);
              showToast('Conta criada na nuvem! Bem-vindo(a) ao JL Automotive.');
            }}
          />
        )}

        {/* Toast feedback */}
        {toastState && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-in slide-in-from-bottom-2 ${
              toastState.isError ? 'bg-red-600 text-white' : 'bg-emerald-500 text-black'
            }`}
          >
            {toastState.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-black" />
            )}
            <span>{toastState.message}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors flex flex-col pb-28 ${
        isLight ? 'bg-zinc-100 text-black font-medium' : 'bg-black text-zinc-100'
      }`}
    >
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenDatabaseTables={() => setIsDatabaseTablesModalOpen(true)}
        onLogout={handleLogout}
        profile={profile}
        totalBudgets={budgets.length}
        isSyncing={isSyncing}
        onManualSync={() => refreshDataFromCloud(true)}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
        {/* Quick Summary Pill Bar / Hero Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase font-black tracking-wider ${
                isLight ? 'text-black' : 'text-zinc-400'
              }`}>
                Painel de Controle
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
              {activeTab === 'calendar' && 'Agenda e Calendário da Oficina'}
              {activeTab === 'clients' && 'Diretório de Clientes & Orçamentos'}
              {activeTab === 'financial' && 'Gestão de Entradas e Saídas'}
              {activeTab === 'balance' && 'Balancete Financeiro Mensal & Anual'}
            </h2>
          </div>

          {/* Quick Action Shortcuts: com botão EM CIMA do botão + Novo Orçamento */}
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            {/* Requirement: E em cima do botão + Novo Orçamento Coloque um botão para abrir o Orçamento que foi feito e para que eu possa alterar as descrições do andamento do serviço ate a conclusão do serviço */}
            <button
              type="button"
              onClick={() => setIsExistingBudgetsModalOpen(true)}
              className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all active:scale-98 shadow-xs ${
                isLight
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  : 'bg-amber-950/70 hover:bg-amber-950 text-amber-300 border-amber-700/80'
              }`}
              title="Abrir orçamento feito para alterar as descrições do andamento do serviço até a conclusão"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Abrir Orçamento (Andamento do Serviço)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenNewBudget()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-98 ${
                  isLight
                    ? 'bg-[#00FF7F] hover:bg-[#00e676] text-black shadow-emerald-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-black shadow-emerald-600/30'
                }`}
              >
                <FilePlus className="w-4 h-4 text-black" />
                <span>+ Novo Orçamento</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('financial');
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isLight
                    ? 'border-zinc-400 bg-white hover:bg-zinc-100 text-black shadow-xs'
                    : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('financial');
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isLight
                    ? 'border-zinc-400 bg-white hover:bg-zinc-100 text-black shadow-xs'
                    : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                <span>+ Saída</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher based on Active Tab */}
        {activeTab === 'calendar' && (
          <CalendarView
            budgets={budgets}
            transactions={transactions}
            events={events}
            checklists={checklists}
            onOpenNewBudget={handleOpenNewBudget}
            onOpenFinancialEntry={handleOpenFinancialEntry}
            onOpenFinancialExpense={handleOpenFinancialExpense}
            onOpenAddClient={() => setActiveTab('clients')}
            onOpenEventModal={(presetDate) => {
              setPresetEventDate(presetDate);
              setIsEventModalOpen(true);
            }}
            theme={theme}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            budgets={budgets}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onNewBudgetForClient={handleNewBudgetForClient}
            onOpenBudgetToEdit={handleOpenBudgetToEdit}
            theme={theme}
          />
        )}

        {activeTab === 'financial' && (
          <FinancialView
            transactions={transactions}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            presetDate={presetFinancialDate}
            presetType={presetFinancialType}
            theme={theme}
          />
        )}

        {activeTab === 'balance' && (
          <BalanceteView transactions={transactions} theme={theme} />
        )}
      </main>

      {/* Fixed Bottom Menu Bar with the 4 Buttons */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewBudget={() => handleOpenNewBudget()}
        theme={theme}
      />

      {/* Modal para Abrir Orçamento Feito e Alterar Andamento do Serviço */}
      <ExistingBudgetsModal
        isOpen={isExistingBudgetsModalOpen}
        budgets={budgets}
        onClose={() => setIsExistingBudgetsModalOpen(false)}
        onSelectBudget={handleOpenBudgetToEdit}
        onDeleteBudget={handleDeleteBudget}
        theme={theme}
      />

      {/* Novo Orçamento / Edição de Orçamento Modal */}
      {isBudgetModalOpen && (
        <BudgetModal
          key={budgetToEdit ? budgetToEdit.id : presetBudgetDate || 'new-budget'}
          isOpen={isBudgetModalOpen}
          initialBudget={budgetToEdit}
          presetDate={presetBudgetDate}
          onClose={() => {
            setIsBudgetModalOpen(false);
            setBudgetToEdit(null);
            setPresetBudgetDate(undefined);
          }}
          onSave={handleSaveBudget}
          onDelete={handleDeleteBudget}
          theme={theme}
        />
      )}

      {/* Perfil do Usuário Modal - Keyed so state reinitializes cleanly on open */}
      {isProfileModalOpen && (
        <ProfileModal
          key={`profile_${profile.email}_${profile.phone}`}
          isOpen={isProfileModalOpen}
          profile={profile}
          onSaveProfile={handleSaveProfile}
          onClose={() => setIsProfileModalOpen(false)}
          theme={theme}
        />
      )}

      {/* Modal de Eventos, Notas e Lembretes da Agenda */}
      {isEventModalOpen && (
        <EventModal
          key={presetEventDate || 'event-modal'}
          isOpen={isEventModalOpen}
          presetDate={presetEventDate}
          events={events}
          onClose={() => {
            setIsEventModalOpen(false);
            setPresetEventDate(undefined);
          }}
          onSaveEvent={handleSaveEvent}
          onDeleteEvent={handleDeleteEvent}
          theme={theme}
        />
      )}

      {/* Modal de Tabelas Organizadoras e Banco de Dados Cloud SQL */}
      {isDatabaseTablesModalOpen && (
        <DatabaseTablesModal
          isOpen={isDatabaseTablesModalOpen}
          onClose={() => setIsDatabaseTablesModalOpen(false)}
          theme={theme}
          profile={profile}
          budgets={budgets}
          clients={clients}
          transactions={transactions}
          events={events}
          checklists={checklists}
          onSaveEvent={handleSaveEvent}
          onDeleteEvent={handleDeleteEvent}
          onSaveChecklist={handleSaveChecklist}
          onDeleteChecklist={handleDeleteChecklist}
          onTriggerSync={async () => {
            const res = await triggerCloudSync({
              budgets,
              clients,
              transactions,
              events,
              checklists,
              profile,
            });
            if (res.success) {
              await refreshDataFromCloud(false);
              showToast('Dados sincronizados com sucesso no Cloud SQL!');
            } else {
              showToast(res.error || 'Falha ao sincronizar com o banco de dados.', true);
            }
          }}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
        />
      )}

      {/* Floating Success / Error Toast */}
      {toastState && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold ${
              toastState.isError
                ? 'bg-red-600 text-white border-red-500 shadow-red-950/30'
                : isLight
                ? 'bg-white text-zinc-900 border-emerald-400 shadow-emerald-950/10'
                : 'bg-zinc-900 text-white border-emerald-500/50 shadow-emerald-950/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                toastState.isError
                  ? 'bg-white'
                  : isLight
                  ? 'bg-[#00FF7F]'
                  : 'bg-emerald-400'
              }`}
            />
            <span>{toastState.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
