'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  Wrench,
  Clock,
  Car,
  User,
  Phone,
  Calendar,
  DollarSign,
  ChevronRight,
  FileCheck2,
  Filter,
} from 'lucide-react';
import { Budget, BudgetStatus } from '@/lib/types';
import { getStatusConfig, STATUS_OPTIONS } from '@/lib/statusConfig';
import { formatBRL } from '@/lib/formatters';

interface ExistingBudgetsModalProps {
  isOpen: boolean;
  budgets: Budget[];
  onClose: () => void;
  onSelectBudget: (budget: Budget) => void;
  theme: 'light-cyan' | 'dark-spring';
}

export function ExistingBudgetsModal({
  isOpen,
  budgets,
  onClose,
  onSelectBudget,
  theme,
}: ExistingBudgetsModalProps) {
  const isLight = theme === 'light-cyan';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  if (!isOpen) return null;

  // Filter budgets
  const filteredBudgets = budgets.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.clientName.toLowerCase().includes(q) ||
      b.vehicleModel.toLowerCase().includes(q) ||
      (b.plate && b.plate.toLowerCase().includes(q)) ||
      (b.serviceDescription && b.serviceDescription.toLowerCase().includes(q));

    const matchStatus =
      statusFilter === 'todos' || b.status.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border transition-all ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-950 text-emerald-400'
              }`}
            >
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Andamento dos Orçamentos & Serviços
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Selecione um orçamento para alterar as descrições de avarias e atualizar o status até a entrega
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar: Search and Status tags */}
        <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, veículo, placa ou descrição do serviço..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm font-medium border focus:outline-hidden transition-all ${
                isLight
                  ? 'bg-white border-zinc-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-400'
                  : 'bg-zinc-800 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white placeholder:text-zinc-500'
              }`}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                statusFilter === 'todos'
                  ? isLight
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-emerald-600 text-black border-emerald-500'
                  : isLight
                  ? 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
              }`}
            >
              Todos ({budgets.length})
            </button>

            {STATUS_OPTIONS.map((st) => {
              const cfg = getStatusConfig(st);
              const count = budgets.filter((b) => b.status === st).length;
              const isSelected = statusFilter.toLowerCase() === st.toLowerCase();
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                    isSelected
                      ? isLight
                        ? 'bg-cyan-100 text-cyan-950 border-cyan-400 ring-2 ring-cyan-200'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-600 ring-2 ring-emerald-900'
                      : isLight
                      ? 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotBg} border ${cfg.dotBorder}`} />
                  <span>{st}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Budgets List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div
                className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
                  isLight ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                <FileCheck2 className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-zinc-500">
                Nenhum orçamento encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            filteredBudgets.map((b) => {
              const cfg = getStatusConfig(b.status);
              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                    isLight
                      ? 'bg-white border-zinc-200 hover:border-cyan-400'
                      : 'bg-zinc-850 border-zinc-750 hover:border-emerald-600'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Client & Vehicle details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-zinc-900 dark:text-white">
                          {b.clientName}
                        </span>

                        {/* Status with Colored Circle */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border ${
                            isLight ? cfg.badgeBgLight : cfg.badgeBgDark
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full ${cfg.dotBg} border ${cfg.dotBorder} ring-2 ${cfg.dotRing} shrink-0`}
                          />
                          <span>{b.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-zinc-400" />
                          <strong className="text-zinc-800 dark:text-zinc-200">
                            {b.vehicleModel}
                          </strong>
                          {b.plate && ` • ${b.plate}`}
                          {b.vehicleColor && ` • ${b.vehicleColor}`}
                        </span>

                        {b.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            {b.phone}
                          </span>
                        )}

                        {b.deadlineDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            Previsão: {b.deadlineDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount & Action Button */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatBRL(b.amount)}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectBudget(b);
                          onClose();
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs active:scale-98 ${
                          isLight
                            ? 'bg-cyan-700 hover:bg-cyan-800 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-black'
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Alterar Andamento</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Service Description preview */}
                  {b.serviceDescription && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                      <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        <strong className="text-zinc-900 dark:text-zinc-100">Serviço/Avarias: </strong>
                        {b.serviceDescription}
                      </p>
                      {b.notes && (
                        <p className="text-zinc-500 dark:text-zinc-400 line-clamp-1 italic text-[11px] mt-0.5">
                          Obs: {b.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>{filteredBudgets.length} orçamento(s) listado(s)</span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
              isLight
                ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
