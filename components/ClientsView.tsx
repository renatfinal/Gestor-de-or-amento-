'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Car,
  FileText,
  Edit2,
  Trash2,
  X,
  Save,
  MessageCircle,
} from 'lucide-react';
import { Client, Budget } from '@/lib/types';
import { formatPhone } from '@/lib/formatters';
import { getStatusConfig, STATUS_OPTIONS } from '@/lib/statusConfig';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ClientsViewProps {
  clients: Client[];
  budgets: Budget[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onNewBudgetForClient: (client: Client) => void;
  onOpenBudgetToEdit?: (budget: Budget) => void;
  theme: 'light-cyan' | 'dark-spring';
}

export function ClientsView({
  clients,
  budgets,
  onSaveClient,
  onDeleteClient,
  onNewBudgetForClient,
  onOpenBudgetToEdit,
  theme,
}: ClientsViewProps) {
  const isLight = theme === 'light-cyan';

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Editing Client state
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Deleting confirmation
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Form fields for editing/adding
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter clients and ensure sorted alphabetically (A-Z)
  const filteredClients = clients
    .filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.lastVehicle && c.lastVehicle.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const handleOpenEditor = (client?: Client) => {
    setFormError(null);
    if (client) {
      setEditingClient(client);
      setFormName(client.name);
      setFormPhone(client.phone);
      setFormEmail(client.email || '');
      setFormVehicle(client.lastVehicle || '');
      setFormNotes(client.notes || '');
    } else {
      setEditingClient(null);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormVehicle('');
      setFormNotes('');
    }
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingClient(null);
    setFormError(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('O nome do cliente é obrigatório.');
      return;
    }

    const updatedClient: Client = {
      id: editingClient?.id || `client_${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      lastVehicle: formVehicle.trim(),
      notes: formNotes.trim(),
      totalBudgetsCount: editingClient?.totalBudgetsCount || 0,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
    };

    onSaveClient(updatedClient);
    handleCloseEditor();
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div
        className={`p-5 md:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-zinc-200/90 shadow-sm'
            : 'bg-zinc-900 border-zinc-800 shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Users className={`w-5 h-5 ${isLight ? 'text-cyan-600' : 'text-emerald-400'}`} />
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Clientes & Orçamentos
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Lista ordenada alfabeticamente (A-Z) com histórico de veículos e orçamentos vinculados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenEditor()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
              isLight
                ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            <Plus className="w-4 h-4" />
            Cadastrar Cliente
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do cliente, telefone ou veículo..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
              isLight
                ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
            }`}
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        </div>

        {/* Status Colors Legend */}
        <div className="mt-3.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Legenda do Estado do Serviço (Bolinha abaixo da lixeira):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            {STATUS_OPTIONS.map((st) => {
              const cfg = getStatusConfig(st);
              return (
                <div
                  key={st}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                    isLight ? cfg.badgeBgLight : cfg.badgeBgDark
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${cfg.dotBg} border ${cfg.dotBorder} ring-1 ${cfg.dotRing} shrink-0`}
                  />
                  <span>{st}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clients Grid / List (Ordem Alfabética) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div
            className={`col-span-full p-10 rounded-2xl border text-center ${
              isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <Users className="w-10 h-10 mx-auto text-zinc-400 mb-2 opacity-50" />
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">
              Nenhum cliente encontrado
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchTerm
                ? 'Tente pesquisar com outro termo.'
                : 'Crie um orçamento para adicionar automaticamente novos clientes.'}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => {
            // Find budgets for this client (most recent first)
            const clientBudgets = budgets
              .filter(
                (b) =>
                  b.clientName.toLowerCase() === client.name.toLowerCase() ||
                  (client.phone && b.phone === client.phone)
              )
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const latestBudget = clientBudgets[0];
            const latestConfig = latestBudget ? getStatusConfig(latestBudget.status) : null;
            const cleanPhone = client.phone.replace(/\D/g, '');

            return (
              <div
                key={client.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLight
                    ? 'bg-white border-zinc-200 hover:border-cyan-300 shadow-xs hover:shadow-md'
                    : 'bg-zinc-900 border-zinc-800 hover:border-emerald-700/80 shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar with Name & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                          isLight
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                          {client.name}
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          {client.phone || 'Sem telefone'}
                        </p>
                      </div>
                    </div>

                    {/* Options: Editar nome a nome & Excluir, e embaixo da lixeira a bolinha na cor da descrição */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(client)}
                          title="Editar Cliente"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setClientToDelete(client.id)}
                          title="Excluir Cliente"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Requirement: Na pagina Clientes em baixo da lixeira aparecera essa bolinha na cor da descrição */}
                      {latestBudget && latestConfig ? (
                        <button
                          type="button"
                          onClick={() => onOpenBudgetToEdit?.(latestBudget)}
                          title={`Estado do Serviço: ${latestBudget.status} (${latestConfig.colorName}) - Clique para abrir o orçamento e alterar o andamento`}
                          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all hover:scale-105 active:scale-95 shadow-xs ${
                            isLight
                              ? 'bg-white border-zinc-300 hover:border-zinc-500 text-zinc-900'
                              : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500 text-zinc-100'
                          }`}
                        >
                          {/* Bolinha na cor da descrição */}
                          <span
                            className={`w-3.5 h-3.5 rounded-full ${latestConfig.dotBg} border ${latestConfig.dotBorder} ring-2 ${latestConfig.dotRing} shrink-0`}
                          />
                          <span className="truncate max-w-[85px]">{latestBudget.status}</span>
                        </button>
                      ) : (
                        <div
                          title="Sem orçamento cadastrado para este cliente"
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700"
                        >
                          <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          <span>Sem serviço</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle & Notes info */}
                  <div className="my-3 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {client.lastVehicle && (
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{client.lastVehicle}</span>
                      </div>
                    )}
                    {client.notes && (
                      <p className="text-[11px] text-zinc-400 italic line-clamp-2 mt-1">
                        &quot;{client.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Budgets Count Badge & List preview */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    {latestBudget ? (
                      <button
                        type="button"
                        onClick={() => onOpenBudgetToEdit?.(latestBudget)}
                        className={`text-xs font-bold flex items-center gap-1.5 hover:underline ${
                          isLight ? 'text-cyan-800' : 'text-emerald-400'
                        }`}
                        title="Clique para abrir e alterar o andamento do serviço"
                      >
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{clientBudgets.length} orçamento(s)</span>
                        <span className="text-[10px] opacity-75 font-normal">(abrir)</span>
                      </button>
                    ) : (
                      <span className="text-zinc-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        {clientBudgets.length} orçamento(s)
                      </span>
                    )}

                    {cleanPhone.length >= 10 && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=55${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Action: Criar Orçamento para este Cliente */}
                <div className="mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => onNewBudgetForClient(client)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                      isLight
                        ? 'border-zinc-200 hover:border-cyan-400 hover:bg-cyan-50 text-cyan-800'
                        : 'border-zinc-800 hover:border-emerald-600 hover:bg-emerald-950/30 text-emerald-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Novo Orçamento p/ este Cliente
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Editar / Adicionar Cliente com X para fechar e botão Salvar */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
          >
            {/* Requirement: com X para fechar pagina */}
            <button
              onClick={handleCloseEditor}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Fechar (X)"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div
                className={`p-2 rounded-xl ${
                  isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-950 text-emerald-400'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <p className="text-xs text-zinc-500">
                  Preencha os dados e salve na lista alfabética
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Santos"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                  placeholder="(XX) XXXXX-XXXX"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border font-mono focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Veículo do Cliente (Marca/Modelo)
                </label>
                <input
                  type="text"
                  value={formVehicle}
                  onChange={(e) => setFormVehicle(e.target.value)}
                  placeholder="Ex: Volkswagen Polo 1.0 TSI"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Preferência por tintas originais, cliente fidelizado..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              {/* Requirement: com X para fechar pagina e botão Salvar */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseEditor}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                    isLight
                      ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-98 ${
                    isLight
                      ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal before deleting */}
      <DeleteConfirmModal
        isOpen={clientToDelete !== null}
        title="Excluir Cliente"
        message="Deseja excluir este cliente da lista?"
        onConfirm={() => {
          if (clientToDelete) {
            onDeleteClient(clientToDelete);
            setClientToDelete(null);
          }
        }}
        onCancel={() => setClientToDelete(null)}
      />
    </div>
  );
}
