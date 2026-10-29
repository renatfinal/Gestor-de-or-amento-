'use client';

import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  X,
  Save,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { FinancialTransaction, TransactionType } from '@/lib/types';
import { formatBRL, formatCurrencyInput, isoToBrDate } from '@/lib/formatters';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface FinancialViewProps {
  transactions: FinancialTransaction[];
  onSaveTransaction: (tx: FinancialTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  presetDate?: string; // YYYY-MM-DD
  presetType?: TransactionType;
  theme: 'light-cyan' | 'dark-spring';
}

export function FinancialView({
  transactions,
  onSaveTransaction,
  onDeleteTransaction,
  presetDate,
  presetType,
  theme,
}: FinancialViewProps) {
  const isLight = theme === 'light-cyan';

  // Active view tab: 'all' | 'entrada' | 'saida'
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'entrada' | 'saida'>(
    presetType || 'all'
  );

  // Month and Year filter for financial entries
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Deletion Modal state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialTransaction | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<TransactionType>('entrada');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAmountStr, setFormAmountStr] = useState('0,00');
  const [formNumericAmount, setFormNumericAmount] = useState(0);
  const [formDate, setFormDate] = useState(presetDate || new Date().toISOString().slice(0, 10));
  const [formIsPaid, setFormIsPaid] = useState(true);
  const [formPaymentMethod, setFormPaymentMethod] = useState('PIX');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter transactions
  const filteredList = transactions.filter((t) => {
    if (activeSubTab !== 'all' && t.type !== activeSubTab) return false;

    if (t.date) {
      const [yStr, mStr] = t.date.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;

      if (y !== selectedYear) return false;
      if (selectedMonth !== 'all' && m !== selectedMonth) return false;
    }
    return true;
  });

  // Calculate Totals requested by user:
  // Entrada, Saída, Saldo Devedor, Saldo
  const allYearTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const y = parseInt(t.date.split('-')[0], 10);
    return y === selectedYear;
  });

  const totalEntrada = allYearTransactions
    .filter((t) => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaida = allYearTransactions
    .filter((t) => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  // Saldo Devedor: Total de saídas pendentes (não pagas / a pagar)
  const saldoDevedor = allYearTransactions
    .filter((t) => t.type === 'saida' && !t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);

  // Saldo Líquido
  const saldoLiquido = totalEntrada - totalSaida;

  const handleOpenAdd = (type: TransactionType, datePreset?: string) => {
    setEditingItem(null);
    setFormType(type);
    setFormDescription('');
    setFormCategory(
      type === 'entrada' ? 'Orçamento Automotivo' : 'Tintas & Materiais'
    );
    setFormAmountStr('0,00');
    setFormNumericAmount(0);
    setFormDate(datePreset || presetDate || new Date().toISOString().slice(0, 10));
    setFormIsPaid(type === 'entrada' ? true : false);
    setFormPaymentMethod('PIX');
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: FinancialTransaction) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormAmountStr(item.formattedAmount || item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    setFormNumericAmount(item.amount);
    setFormDate(item.date || new Date().toISOString().slice(0, 10));
    setFormIsPaid(item.isPaid);
    setFormPaymentMethod(item.paymentMethod || 'PIX');
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  // Requirement: Com valor quando digitar os números ja separar com vírgula e ponto ex 0.000,00
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formatted, numeric } = formatCurrencyInput(e.target.value);
    setFormAmountStr(formatted);
    setFormNumericAmount(numeric);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      setFormError('Por favor, informe a descrição do lançamento.');
      return;
    }
    if (formNumericAmount <= 0) {
      setFormError('O valor deve ser maior que zero (0,00).');
      return;
    }

    const newTx: FinancialTransaction = {
      id: editingItem?.id || `tx_${Date.now()}`,
      type: formType,
      description: formDescription.trim(),
      category: formCategory.trim() || (formType === 'entrada' ? 'Receita' : 'Despesa'),
      amount: formNumericAmount,
      formattedAmount: formAmountStr,
      date: formDate,
      isPaid: formIsPaid,
      paymentMethod: formPaymentMethod,
      budgetId: editingItem?.budgetId,
      clientName: editingItem?.clientName,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    onSaveTransaction(newTx);
    handleCloseEditor();
  };

  // Toggle isPaid for quick inline status change
  const handleTogglePaid = (item: FinancialTransaction) => {
    const updated: FinancialTransaction = {
      ...item,
      isPaid: !item.isPaid,
    };
    onSaveTransaction(updated);
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards de Totais: Entrada, Saída, Saldo Devedor, Saldo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Entrada */}
        <div
          className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-white border-zinc-200/90 shadow-xs'
              : 'bg-zinc-900 border-zinc-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Entrada
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatBRL(totalEntrada)}
          </p>
          <span className="text-[11px] text-zinc-400">Receitas em {selectedYear}</span>
        </div>

        {/* Total Saída */}
        <div
          className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-white border-zinc-200/90 shadow-xs'
              : 'bg-zinc-900 border-zinc-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Saída
            </span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-2xl font-black text-red-600 dark:text-red-400 mt-2">
            {formatBRL(totalSaida)}
          </p>
          <span className="text-[11px] text-zinc-400">Despesas em {selectedYear}</span>
        </div>

        {/* Saldo Devedor */}
        <div
          className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-white border-zinc-200/90 shadow-xs'
              : 'bg-zinc-900 border-zinc-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Saldo Devedor
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatBRL(saldoDevedor)}
          </p>
          <span className="text-[11px] text-zinc-400">Despesas a pagar</span>
        </div>

        {/* Saldo Líquido */}
        <div
          className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-white border-zinc-200/90 shadow-xs'
              : 'bg-zinc-900 border-zinc-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Saldo Líquido
            </span>
            <div
              className={`p-2 rounded-xl ${
                saldoLiquido >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-lg md:text-2xl font-black mt-2 ${
              saldoLiquido >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatBRL(saldoLiquido)}
          </p>
          <span className="text-[11px] text-zinc-400">
            {saldoLiquido >= 0 ? 'Lucro acumulado' : 'Resultado negativo'}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`p-5 md:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-zinc-200/90 shadow-sm'
            : 'bg-zinc-900 border-zinc-800 shadow-xl'
        }`}
      >
        {/* Navigation & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
          {/* Sub-tabs: Todos, Entradas, Saídas */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 max-w-fit">
            <button
              type="button"
              onClick={() => setActiveSubTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'all'
                  ? isLight
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'bg-zinc-700 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Todos os Lançamentos
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('entrada')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'entrada'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Entradas
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('saida')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'saida'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Saídas
            </button>
          </div>

          {/* Action buttons: + Entrada, + Saída */}
          <div className="flex items-center gap-2">
            {/* Botão para adicionar outras entradas */}
            <button
              type="button"
              onClick={() => handleOpenAdd('entrada')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Nova Entrada
            </button>

            {/* Botão para adicionar mais caixinhas de saída */}
            <button
              type="button"
              onClick={() => handleOpenAdd('saida')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Nova Saída
            </button>
          </div>
        </div>

        {/* Filter by Month & Year */}
        <div className="flex flex-wrap items-center gap-3 my-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtro de Período:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border focus:outline-hidden ${
              isLight
                ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                : 'bg-zinc-800 border-zinc-700 text-zinc-200'
            }`}
          >
            <option value="all">Ano Todo</option>
            <option value={0}>Janeiro</option>
            <option value={1}>Fevereiro</option>
            <option value={2}>Março</option>
            <option value={3}>Abril</option>
            <option value={4}>Maio</option>
            <option value={5}>Junho</option>
            <option value={6}>Julho</option>
            <option value={7}>Agosto</option>
            <option value={8}>Setembro</option>
            <option value={9}>Outubro</option>
            <option value={10}>Novembro</option>
            <option value={11}>Dezembro</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border focus:outline-hidden ${
              isLight
                ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                : 'bg-zinc-800 border-zinc-700 text-zinc-200'
            }`}
          >
            {Array.from({ length: 15 }).map((_, i) => {
              const yr = currentYear - 5 + i;
              return (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              );
            })}
          </select>
        </div>

        {/* Transactions Table / List */}
        <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <p className="text-sm">Nenhum lançamento financeiro encontrado para este período.</p>
              <p className="text-xs mt-1">Clique em Nova Entrada ou Nova Saída para lançar valores.</p>
            </div>
          ) : (
            filteredList.map((item) => {
              const isEntrada = item.type === 'entrada';
              return (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 px-2 rounded-xl"
                >
                  {/* Left: Type Icon + Description + Date */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isEntrada
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isEntrada ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">
                          {item.description}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isEntrada
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {isoToBrDate(item.date)}
                        </span>
                        {item.paymentMethod && <span>• {item.paymentMethod}</span>}
                        {item.clientName && <span>• {item.clientName}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Value, Pago toggle, Edit, Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 ml-11 sm:ml-0">
                    {/* Status Pago checkbox (especialmente para Saída) */}
                    <button
                      type="button"
                      onClick={() => handleTogglePaid(item)}
                      title="Alternar Pago / Pendente"
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        item.isPaid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pago</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pendente</span>
                        </>
                      )}
                    </button>

                    {/* Amount */}
                    <span
                      className={`font-mono font-bold text-sm md:text-base ${
                        isEntrada
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isEntrada ? '+' : '-'} {formatBRL(item.amount)}
                    </span>

                    {/* Actions: Edit + Trash */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Editar Lançamento"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Requirement: ícone de lixeira para excluir caso necessario mas antes de excluir abrir pequena janela com mensagem ( Deseja excluir) botão Não na cor vermelha e Sim na cor verde. Com X para fechar */}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item.id)}
                        title="Excluir Lançamento"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Criação / Edição de Entrada ou Saída com X para fechar */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
          >
            {/* Requirement: Com X para fechar */}
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
                className={`p-2.5 rounded-xl ${
                  formType === 'entrada'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {formType === 'entrada' ? (
                  <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {editingItem ? 'Editar Lançamento' : `Nova ${formType === 'entrada' ? 'Entrada' : 'Saída'}`}
                </h3>
                <p className="text-xs text-zinc-500">
                  {formType === 'entrada'
                    ? 'Registro de recebimentos da oficina'
                    : 'Registro de despesas e compras de materiais'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormType('entrada')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    formType === 'entrada'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Entrada (Receita)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('saida')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    formType === 'saida'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Saída (Despesa)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Descrição do Lançamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={
                    formType === 'entrada'
                      ? 'Ex: Sinal 50% Pintura HB20'
                      : 'Ex: Compra de tintas e verniz na distribuidora'
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              {/* Requirement: Com valor quando digitar os números ja separar com vírgula e ponto ex 0.000,00 */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Valor (R$)</span>
                  <span className="text-[10px] text-zinc-400">Ex: 0.000,00 automático</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-400">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formAmountStr}
                    onChange={handleAmountInputChange}
                    placeholder="0,00"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm font-mono font-bold border focus:outline-hidden transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                        : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-hidden ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500'
                        : 'bg-zinc-800 border-zinc-700 focus:border-emerald-500 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ex: Tintas, Peças, Sinal"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-hidden ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500'
                        : 'bg-zinc-800 border-zinc-700 focus:border-emerald-500 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Requirement: colocar opção para listar como pago */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
                <div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Status do Pagamento
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {formIsPaid ? 'Consta como Pago' : 'Consta como Pendente / Saldo Devedor'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPaid}
                    onChange={(e) => setFormIsPaid(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Save & Cancel */}
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
                    formType === 'entrada'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal before deleting (Requirement: mensagem Deseja excluir com botão Não na cor vermelha e Sim na cor verde, com X para fechar) */}
      <DeleteConfirmModal
        isOpen={itemToDelete !== null}
        title="Excluir Lançamento"
        message="Deseja excluir este lançamento financeiro?"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteTransaction(itemToDelete);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
