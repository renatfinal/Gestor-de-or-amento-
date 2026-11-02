'use client';

import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  ArrowDownLeft,
  ArrowUpRight,
  Wrench,
  CheckCircle2,
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
  clearStoredSession,
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
} from '@/lib/storage';
import { getBudgetsFromIndexedDb } from '@/lib/imageStorage';
import { syncDataToCloud, fetchCloudData } from '@/lib/cloudSync';
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

  // Authentication Session
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  // Real-time automatic Cloud SQL synchronization
  const triggerCloudSync = async (overrides?: {
    budgets?: Budget[];
    clients?: Client[];
    transactions?: FinancialTransaction[];
    events?: CalendarEvent[];
    checklists?: VehicleChecklist[];
    profile?: UserProfile;
  }) => {
    const userEmail = session?.email || profile.email || 'jl.automotive@gmail.com';
    setIsSyncing(true);
    try {
      await syncDataToCloud(userEmail, {
        budgets: overrides?.budgets ?? budgets,
        clients: overrides?.clients ?? clients,
        transactions: overrides?.transactions ?? transactions,
        events: overrides?.events ?? events,
        checklists: overrides?.checklists ?? checklists,
        profile: overrides?.profile ?? profile,
      });
      setLastSyncTime(new Date());
    } catch (e) {
      console.warn('Real-time sync to Cloud SQL notice:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
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

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
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

  // Asynchronously hydrate from IndexedDB if budgets with high-res photos exist
  useEffect(() => {
    getBudgetsFromIndexedDb()
      .then((idbBudgets) => {
        if (idbBudgets && Array.isArray(idbBudgets) && idbBudgets.length > 0) {
          setBudgets(idbBudgets as Budget[]);
        }
      })
      .catch(() => {});
  }, []);

  // Hydrate data from Cloud SQL database automatically when session is present
  useEffect(() => {
    const targetEmail = session?.email || profile.email || 'jl.automotive@gmail.com';
    fetchCloudData(targetEmail)
      .then((cloudData) => {
        if (cloudData) {
          if (cloudData.budgets && cloudData.budgets.length > 0) {
            setBudgets(cloudData.budgets);
            saveStoredBudgets(cloudData.budgets);
          }
          if (cloudData.clients && cloudData.clients.length > 0) {
            setClients(cloudData.clients);
            saveStoredClients(cloudData.clients);
          }
          if (cloudData.transactions && cloudData.transactions.length > 0) {
            setTransactions(cloudData.transactions);
            saveStoredTransactions(cloudData.transactions);
          }
          if (cloudData.events && cloudData.events.length > 0) {
            setEvents(cloudData.events);
            saveStoredEvents(cloudData.events);
          }
          if (cloudData.checklists && cloudData.checklists.length > 0) {
            setChecklists(cloudData.checklists);
            saveStoredChecklists(cloudData.checklists);
          }
          setLastSyncTime(new Date());
        } else {
          // Push initial data to Cloud SQL database
          triggerCloudSync();
        }
      })
      .catch((err) => {
        console.warn('Initial cloud fetch notice:', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email, profile.email]);

  const handleToggleTheme = () => {
    const newTheme: ThemeMode = theme === 'dark-spring' ? 'light-spring' : 'dark-spring';
    setTheme(newTheme);
    saveStoredTheme(newTheme);
  };

  // Handle Saving Budget:
  // Requirement: "Quando Fazer o orçamento e salvar trazer o nome e telefone para essa pagina automático e salvar uma lista de clientes com ordem alfabética"
  const handleSaveBudget = (budgetToSave: Budget) => {
    // 1. Update Budgets
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

    // 2. Automatically sync Client to alphabetical list
    if (budgetToSave.clientName && budgetToSave.clientName.trim()) {
      const trimmedName = budgetToSave.clientName.trim();
      const existingClientIndex = clients.findIndex(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingClientIndex >= 0) {
        // Update existing client
        updatedClients = clients.map((c, idx) => {
          if (idx === existingClientIndex) {
            return {
              ...c,
              phone: budgetToSave.phone || c.phone,
              lastVehicle: budgetToSave.vehicleModel || c.lastVehicle,
              totalBudgetsCount: (c.totalBudgetsCount || 0) + (exists ? 0 : 1),
            };
          }
          return c;
        });
      } else {
        // Add new client automatically
        const newClient: Client = {
          id: `c_${Date.now()}`,
          name: trimmedName,
          phone: budgetToSave.phone || '',
          lastVehicle: budgetToSave.vehicleModel || '',
          totalBudgetsCount: 1,
          createdAt: new Date().toISOString(),
        };
        updatedClients = [...clients, newClient];
      }

      // Sort alphabetically A-Z
      updatedClients.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      setClients(updatedClients);
      saveStoredClients(updatedClients);
    }

    // Sync to Cloud SQL in real time
    triggerCloudSync({ budgets: updatedBudgets, clients: updatedClients });

    showToast(`Orçamento para ${budgetToSave.clientName} salvo com sucesso!`);
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
    triggerCloudSync({ clients: updated });
    showToast(`Cliente ${client.name} salvo com sucesso!`);
  };

  const handleDeleteClient = (clientId: string) => {
    const updated = clients.filter((c) => c.id !== clientId);
    setClients(updated);
    saveStoredClients(updated);
    triggerCloudSync({ clients: updated });
    showToast('Cliente removido da lista.');
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
    triggerCloudSync({ transactions: updated });
    showToast(`Lançamento de ${tx.type === 'entrada' ? 'Entrada' : 'Saída'} salvo!`);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
    triggerCloudSync({ transactions: updated });
    showToast('Lançamento excluído com sucesso.');
  };

  // Profile save
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    triggerCloudSync({ profile: newProfile });
    showToast('Perfil atualizado com sucesso!');
  };

  // Events & Notes management
  const handleSaveEvent = (event: CalendarEvent) => {
    let updated: CalendarEvent[];
    const exists = events.some((e) => e.id === event.id);
    if (exists) {
      updated = events.map((e) => (e.id === event.id ? event : e));
    } else {
      updated = [event, ...events];
    }
    setEvents(updated);
    saveStoredEvents(updated);
    triggerCloudSync({ events: updated });
    showToast(`Nota/Evento "${event.title}" salvo no banco de dados!`);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveStoredEvents(updated);
    triggerCloudSync({ events: updated });
    showToast('Nota/Evento removido.');
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
    triggerCloudSync({ checklists: updated });
    showToast(`Check-list "${chk.title}" salvo no banco de dados!`);
  };

  const handleDeleteChecklist = (id: string) => {
    const updated = checklists.filter((c) => c.id !== id);
    setChecklists(updated);
    saveStoredChecklists(updated);
    triggerCloudSync({ checklists: updated });
    showToast('Check-list removido.');
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
          onLoginSuccess={(newSession) => {
            setSession(newSession);
            saveStoredSession(newSession);
            showToast(`Bem-vindo ao JL Automotive, ${profile.name || 'Usuário'}!`);
          }}
          onOpenFirstAccess={() => setIsFirstAccessModalOpen(true)}
        />

        {/* Modal de Primeiro Acesso */}
        {isFirstAccessModalOpen && (
          <ProfileModal
            key="first-access-modal"
            isOpen={isFirstAccessModalOpen}
            profile={profile}
            onSaveProfile={(updatedProfile) => {
              handleSaveProfile(updatedProfile);
              const newSession: AuthSession = {
                email: updatedProfile.email || 'jl.automotive@gmail.com',
                name: updatedProfile.name || 'JL Automotive',
                loggedInAt: new Date().toISOString(),
              };
              setSession(newSession);
              saveStoredSession(newSession);
              showToast(`Perfil cadastrado com sucesso! Bem-vindo(a) ao JL Automotive.`);
            }}
            onClose={() => setIsFirstAccessModalOpen(false)}
            theme={theme}
            isFirstAccess={true}
            onFirstAccessSuccess={(updatedProfile) => {
              const newSession: AuthSession = {
                email: updatedProfile.email || 'jl.automotive@gmail.com',
                name: updatedProfile.name || 'JL Automotive',
                loggedInAt: new Date().toISOString(),
              };
              setSession(newSession);
              saveStoredSession(newSession);
              showToast(`Perfil cadastrado com sucesso! Bem-vindo(a) ao JL Automotive.`);
            }}
          />
        )}

        {/* Toast feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-black" />
            <span>{toastMessage}</span>
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
            await triggerCloudSync();
            showToast('Dados sincronizados com sucesso no Cloud SQL!');
          }}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
        />
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold ${
              isLight
                ? 'bg-white text-zinc-900 border-emerald-400 shadow-emerald-950/10'
                : 'bg-zinc-900 text-white border-emerald-500/50 shadow-emerald-950/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLight ? 'bg-[#00FF7F]' : 'bg-emerald-400'
              }`}
            />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
