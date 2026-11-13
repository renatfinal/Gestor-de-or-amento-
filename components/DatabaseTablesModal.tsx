'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  RefreshCw,
  CheckCircle2,
  Calendar,
  FileText,
  Users,
  DollarSign,
  ClipboardCheck,
  Plus,
  Trash2,
  Search,
  CheckSquare,
  Square,
  Clock,
  Car,
  AlertCircle,
} from 'lucide-react';
import {
  Budget,
  Client,
  FinancialTransaction,
  UserProfile,
  CalendarEvent,
  VehicleChecklist,
  ChecklistItem,
  ThemeMode,
} from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';

interface DatabaseTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  profile: UserProfile;
  budgets: Budget[];
  clients: Client[];
  transactions: FinancialTransaction[];
  events: CalendarEvent[];
  checklists: VehicleChecklist[];
  onSaveEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onSaveChecklist: (checklist: VehicleChecklist) => void;
  onDeleteChecklist: (id: string) => void;
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

type TableTab = 'budgets' | 'clients' | 'balance' | 'events' | 'checklists' | 'account';

export function DatabaseTablesModal({
  isOpen,
  onClose,
  theme,
  profile,
  budgets,
  clients,
  transactions,
  events,
  checklists,
  onSaveEvent,
  onDeleteEvent,
  onSaveChecklist,
  onDeleteChecklist,
  onTriggerSync,
  isSyncing,
  lastSyncTime,
}: DatabaseTablesModalProps) {
  const isLight = theme !== 'dark-spring';
  const [activeTab, setActiveTab] = useState<TableTab>('checklists');
  const [searchQuery, setSearchQuery] = useState('');

  // States for adding a new event
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventType, setNewEventType] = useState<'evento' | 'nota' | 'lembrete' | 'entrega'>('nota');

  // States for adding a new checklist
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newChkTitle, setNewChkTitle] = useState('');
  const [newChkModel, setNewChkModel] = useState('');
  const [newChkPlate, setNewChkPlate] = useState('');
  const [newChkNotes, setNewChkNotes] = useState('');
  const [newChkItems, setNewChkItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'Estepe, macaco e chave de roda', checked: true },
    { id: '2', label: 'Nível de combustível e hodômetro anotados', checked: true },
    { id: '3', label: 'Avarias e arranhões prévios fotografados', checked: true },
    { id: '4', label: 'Pertences pessoais retirados pelo cliente', checked: true },
    { id: '5', label: 'Vidros, retrovisores e lanternas sem trincas', checked: false },
    { id: '6', label: 'Documento e manual do proprietário', checked: false },
  ]);
  const [newChkCustomItem, setNewChkCustomItem] = useState('');

  if (!isOpen) return null;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const event: CalendarEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      date: newEventDate,
      type: newEventType,
      color:
        newEventType === 'entrega'
          ? '#10b981'
          : newEventType === 'lembrete'
          ? '#06b6d4'
          : '#f59e0b',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    onSaveEvent(event);
    setNewEventTitle('');
    setNewEventDesc('');
    setIsAddingEvent(false);
  };

  const handleToggleEventCompleted = (event: CalendarEvent) => {
    onSaveEvent({ ...event, completed: !event.completed });
  };

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChkTitle.trim()) return;
    const chk: VehicleChecklist = {
      id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newChkTitle.trim(),
      vehicleModel: newChkModel.trim(),
      plate: newChkPlate.trim(),
      notes: newChkNotes.trim(),
      items: newChkItems,
      createdAt: new Date().toISOString(),
    };
    onSaveChecklist(chk);
    setNewChkTitle('');
    setNewChkModel('');
    setNewChkPlate('');
    setNewChkNotes('');
    setIsAddingChecklist(false);
  };

  const handleToggleChecklistItem = (chk: VehicleChecklist, itemId: string) => {
    const updatedItems = chk.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onSaveChecklist({ ...chk, items: updatedItems, updatedAt: new Date().toISOString() });
  };

  const handleAddCustomItemToDraft = () => {
    if (!newChkCustomItem.trim()) return;
    setNewChkItems([
      ...newChkItems,
      { id: `item_${Date.now()}`, label: newChkCustomItem.trim(), checked: false },
    ]);
    setNewChkCustomItem('');
  };

  // Filtered queries
  const q = searchQuery.toLowerCase();
  const filteredBudgets = budgets.filter(
    (b) =>
      b.clientName.toLowerCase().includes(q) ||
      b.vehicleModel.toLowerCase().includes(q) ||
      b.plate.toLowerCase().includes(q)
  );

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.lastVehicle && c.lastVehicle.toLowerCase().includes(q))
  );

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q))
  );

  const filteredEvents = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(q) ||
      (ev.description && ev.description.toLowerCase().includes(q))
  );

  const filteredChecklists = checklists.filter(
    (chk) =>
      chk.title.toLowerCase().includes(q) ||
      (chk.vehicleModel && chk.vehicleModel.toLowerCase().includes(q)) ||
      (chk.plate && chk.plate.toLowerCase().includes(q))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900 shadow-emerald-950/20'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight ? 'border-zinc-200 bg-zinc-50/70' : 'border-zinc-800 bg-zinc-900/90'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl shadow-sm ${
                isLight ? 'bg-[#00FF7F] text-black font-black' : 'bg-emerald-600 text-black'
              }`}
            >
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Banco de Dados & Tabelas Organizadoras
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud SQL Ativo
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                JL Automotive • Sincronização automática em tempo real para não perder nenhum dado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Sync trigger button */}
            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-750'
              }`}
              title="Sincronizar agora com o Banco de Dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time sync status strip */}
        <div
          className={`px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b ${
            isLight
              ? 'bg-emerald-100/70 border-emerald-200 text-emerald-950 font-bold'
              : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Contas de usuário, orçamentos, clientes, balancete, eventos e check-lists salvos no banco de dados.
            </span>
          </div>
          <div className="text-[11px] opacity-80">
            {lastSyncTime
              ? `Última sincronização: ${lastSyncTime.toLocaleTimeString('pt-BR')}`
              : 'Sincronização em tempo real ativa'}
          </div>
        </div>

        {/* Tabs Bar */}
        <div
          className={`flex items-center gap-1 px-4 sm:px-6 pt-3 border-b overflow-x-auto ${
            isLight ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-900'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('checklists')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'checklists'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-black'
                  : 'border-[#00FF7F] text-[#00FF7F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Check-lists de Vistoria</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 font-bold">
              {checklists.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'events'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-black'
                  : 'border-[#00FF7F] text-[#00FF7F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Eventos & Notas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 font-bold">
              {events.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'budgets'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-black'
                  : 'border-[#00FF7F] text-[#00FF7F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Orçamentos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 font-bold">
              {budgets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'clients'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-black'
                  : 'border-[#00FF7F] text-[#00FF7F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 font-bold">
              {clients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'balance'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-black'
                  : 'border-[#00FF7F] text-[#00FF7F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Balancete & Lançamentos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 font-bold">
              {transactions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'account'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-black'
                  : 'border-[#00FF7F] text-[#00FF7F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Conta & Banco</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Quick search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar registros nesta tabela..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border transition-all ${
                isLight
                  ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                  : 'bg-zinc-800/80 border-zinc-700 text-white focus:border-emerald-500'
              }`}
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>

          {/* TAB 1: CHECK-LISTS DE VISTORIA */}
          {activeTab === 'checklists' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Tabela de Check-lists de Vistoria de Veículos
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Controle de itens na recepção e entrega para evitar extravios e garantir segurança.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingChecklist(!isAddingChecklist)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer ${
                    isLight ? 'bg-[#00FF7F] text-black hover:bg-[#00e676]' : 'bg-emerald-600 text-black hover:bg-emerald-500'
                  }`}
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Novo Check-list</span>
                </button>
              </div>

              {/* Form to add a new checklist */}
              {isAddingChecklist && (
                <form
                  onSubmit={handleCreateChecklist}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-zinc-800/70 border-zinc-700'
                  }`}
                >
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Cadastrar Novo Check-list de Vistoria
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Título do Check-list</label>
                      <input
                        type="text"
                        required
                        value={newChkTitle}
                        onChange={(e) => setNewChkTitle(e.target.value)}
                        placeholder="Ex: Vistoria Entrada Corolla"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Modelo do Veículo</label>
                      <input
                        type="text"
                        value={newChkModel}
                        onChange={(e) => setNewChkModel(e.target.value)}
                        placeholder="Ex: Toyota Corolla 2023"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Placa</label>
                      <input
                        type="text"
                        value={newChkPlate}
                        onChange={(e) => setNewChkPlate(e.target.value.toUpperCase())}
                        placeholder="Ex: ABC-1234"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1">Itens de Inspeção</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                      {newChkItems.map((item, idx) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => {
                              const updated = [...newChkItems];
                              updated[idx].checked = e.target.checked;
                              setNewChkItems(updated);
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className={item.checked ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-500'}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newChkCustomItem}
                        onChange={(e) => setNewChkCustomItem(e.target.value)}
                        placeholder="Adicionar item customizado ao check-list..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomItemToDraft}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300"
                      >
                        + Adicionar Item
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1">Observações da Vistoria</label>
                    <textarea
                      rows={2}
                      value={newChkNotes}
                      onChange={(e) => setNewChkNotes(e.target.value)}
                      placeholder="Detalhes adicionais, avarias já existentes, etc."
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingChecklist(false)}
                      className="px-3 py-1.5 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                        isLight ? 'bg-[#00FF7F] text-black hover:bg-[#00e676]' : 'bg-emerald-600 text-black'
                      }`}
                    >
                      Salvar no Banco
                    </button>
                  </div>
                </form>
              )}

              {/* Checklists list */}
              {filteredChecklists.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 border rounded-2xl border-dashed">
                  Nenhum check-list cadastrado ainda. Clique em &quot;Novo Check-list&quot; para iniciar.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredChecklists.map((chk) => {
                    const checkedCount = chk.items.filter((i) => i.checked).length;
                    const totalCount = chk.items.length;
                    const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

                    return (
                      <div
                        key={chk.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 shadow-xs'
                            : 'bg-zinc-850/90 border-zinc-750'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              {chk.vehicleModel || 'Veículo'} • Placa: {chk.plate || '---'}
                            </span>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">
                              {chk.title}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteChecklist(chk.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            title="Excluir Check-list"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-[11px] font-medium text-zinc-500 mb-1">
                            <span>Conferência: {checkedCount} de {totalCount} itens checados</span>
                            <span className="font-bold">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {chk.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleChecklistItem(chk, item.id)}
                              className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                                item.checked
                                  ? isLight
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                    : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                                  : isLight
                                  ? 'bg-white border-zinc-200 text-zinc-700'
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                              }`}
                            >
                              {item.checked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-zinc-400 shrink-0" />
                              )}
                              <span className={item.checked ? 'font-medium' : ''}>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        {chk.notes && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 italic">
                            Obs: {chk.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVENTOS, NOTAS E LEMBRETES */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Tabela de Eventos, Notas e Lembretes da Oficina
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Anotações de peças, prazos de entrega e lembretes gerais sincronizados no banco de dados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(!isAddingEvent)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer ${
                    isLight ? 'bg-[#00FF7F] text-black hover:bg-[#00e676]' : 'bg-emerald-600 text-black hover:bg-emerald-500'
                  }`}
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Nova Nota / Evento</span>
                </button>
              </div>

              {/* Form to add a new event/note */}
              {isAddingEvent && (
                <form
                  onSubmit={handleCreateEvent}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-zinc-800/70 border-zinc-700'
                  }`}
                >
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Criar Nova Nota ou Evento
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold mb-1">Título</label>
                      <input
                        type="text"
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Ex: Chegada de tinta perolizada / Entrega do HB20"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Data</label>
                      <input
                        type="date"
                        required
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Tipo</label>
                      <select
                        value={newEventType}
                        onChange={(e: any) => setNewEventType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      >
                        <option value="nota">Nota da Oficina</option>
                        <option value="lembrete">Lembrete de Peças</option>
                        <option value="entrega">Entrega de Veículo</option>
                        <option value="evento">Evento Geral</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold mb-1">Descrição Detalhada</label>
                      <input
                        type="text"
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        placeholder="Ex: Ligar para fornecedor às 14h confirmando o código da cor."
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingEvent(false)}
                      className="px-3 py-1.5 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                        isLight ? 'bg-[#00FF7F] text-black hover:bg-[#00e676]' : 'bg-emerald-600 text-black'
                      }`}
                    >
                      Salvar Nota no Banco
                    </button>
                  </div>
                </form>
              )}

              {/* Events list */}
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 border rounded-2xl border-dashed">
                  Nenhuma nota ou evento cadastrado.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        ev.completed
                          ? 'opacity-60 bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                          : isLight
                          ? 'bg-white border-zinc-200 shadow-xs'
                          : 'bg-zinc-800/80 border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleEventCompleted(ev)}
                          className="cursor-pointer"
                        >
                          {ev.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-zinc-400 hover:text-zinc-600" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                ev.type === 'entrega'
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : ev.type === 'lembrete'
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {ev.type}
                            </span>
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {ev.date}
                            </span>
                          </div>
                          <p
                            className={`text-sm font-bold mt-0.5 ${
                              ev.completed
                                ? 'line-through text-zinc-400'
                                : 'text-zinc-900 dark:text-white'
                            }`}
                          >
                            {ev.title}
                          </p>
                          {ev.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        title="Excluir nota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORÇAMENTOS */}
          {activeTab === 'budgets' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Tabela de Orçamentos da Oficina ({filteredBudgets.length} registros)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}>
                    <tr>
                      <th className="p-3 font-bold">Cliente</th>
                      <th className="p-3 font-bold">Veículo / Placa</th>
                      <th className="p-3 font-bold">Telefone</th>
                      <th className="p-3 font-bold">Valor</th>
                      <th className="p-3 font-bold">Prazo</th>
                      <th className="p-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredBudgets.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="p-3 font-bold">{b.clientName}</td>
                        <td className="p-3">
                          {b.vehicleModel} {b.plate && `(${b.plate})`}
                        </td>
                        <td className="p-3 text-zinc-500">{b.phone || '---'}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {b.formattedAmount || formatCurrency(b.amount)}
                        </td>
                        <td className="p-3 text-zinc-500">{b.deadlineDate || '---'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-zinc-700">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CLIENTES */}
          {activeTab === 'clients' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Tabela de Clientes da JL Automotive ({filteredClients.length} cadastros)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}>
                    <tr>
                      <th className="p-3 font-bold">Nome</th>
                      <th className="p-3 font-bold">Telefone</th>
                      <th className="p-3 font-bold">Último Veículo</th>
                      <th className="p-3 font-bold">Total Orçamentos</th>
                      <th className="p-3 font-bold">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredClients.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="p-3 font-bold">{c.name}</td>
                        <td className="p-3 text-zinc-500">{c.phone || '---'}</td>
                        <td className="p-3">{c.lastVehicle || '---'}</td>
                        <td className="p-3 font-semibold">{c.totalBudgetsCount || 1}</td>
                        <td className="p-3 text-zinc-500 truncate max-w-xs">{c.notes || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BALANCETE & TRANSAÇÕES */}
          {activeTab === 'balance' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Tabela de Balancete & Lançamentos Financeiros ({filteredTransactions.length} registros)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}>
                    <tr>
                      <th className="p-3 font-bold">Data</th>
                      <th className="p-3 font-bold">Tipo</th>
                      <th className="p-3 font-bold">Descrição</th>
                      <th className="p-3 font-bold">Categoria</th>
                      <th className="p-3 font-bold">Forma Pgto</th>
                      <th className="p-3 font-bold">Valor</th>
                      <th className="p-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="p-3 text-zinc-500">{t.date}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.type === 'entrada'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {t.type === 'entrada' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{t.description}</td>
                        <td className="p-3 text-zinc-500">{t.category || '---'}</td>
                        <td className="p-3 text-zinc-500">{t.paymentMethod || 'Outros'}</td>
                        <td
                          className={`p-3 font-bold ${
                            t.type === 'entrada'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {t.type === 'entrada' ? '+' : '-'} R${' '}
                          {t.formattedAmount || formatCurrency(t.amount)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              t.isPaid
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {t.isPaid ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CONTA & BANCO DE DADOS */}
          {activeTab === 'account' && (
            <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    Cloud SQL (PostgreSQL) Conectado com Sucesso
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Todas as contas de usuário e movimentações da JL Automotive são persistidas na nuvem.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-0.5 font-bold">Oficina / Razão</span>
                  <span className="font-black text-zinc-800 dark:text-white">
                    {profile.workshopName || 'JL Automotive'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-0.5 font-bold">E-mail de Login</span>
                  <span className="font-black text-zinc-800 dark:text-white">{profile.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-0.5 font-bold">Telefone de Contato</span>
                  <span className="font-black text-zinc-800 dark:text-white">{profile.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-0.5 font-bold">Status de Sincronismo</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tempo Real & Automático
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 ${
            isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'
          }`}
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
            Dados protegidos e sincronizados com segurança no Cloud SQL da JL Automotive.
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ml-auto ${
              isLight ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-white text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
