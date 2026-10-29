'use client';

import React from 'react';
import { X, FileText, ArrowDownLeft, ArrowUpRight, UserPlus, Calendar } from 'lucide-react';

interface DayActionModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSelectAction: (action: 'budget' | 'entry' | 'expense' | 'add-client', date: Date) => void;
  theme: 'light-cyan' | 'dark-spring';
}

export function DayActionModal({
  isOpen,
  selectedDate,
  onClose,
  onSelectAction,
  theme,
}: DayActionModalProps) {
  if (!isOpen || !selectedDate) return null;

  const isLight = theme === 'light-cyan';

  const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-6 transition-all ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Close Button X */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5 pr-8">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-950/80 text-emerald-400'
            }`}
          >
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Agenda do Dia
            </span>
            <h3 className="text-base font-bold capitalize text-zinc-900 dark:text-white leading-snug">
              {formattedDate}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Escolha uma operação para este dia:
            </p>
          </div>
        </div>

        {/* The 4 options requested by user */}
        <div className="space-y-2.5">
          {/* Option 1: Orçamento */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('budget', selectedDate);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all group ${
              isLight
                ? 'bg-zinc-50/70 hover:bg-cyan-50 border-zinc-200 hover:border-cyan-400'
                : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/80 hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg text-emerald-500 dark:text-emerald-400 font-bold">○</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-white">Orçamento</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Gerar novo orçamento para este dia
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-950 text-emerald-300'
              }`}
            >
              Criar
            </span>
          </button>

          {/* Option 2: Entrada */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('entry', selectedDate);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all group ${
              isLight
                ? 'bg-zinc-50/70 hover:bg-emerald-50 border-zinc-200 hover:border-emerald-400'
                : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/80 hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg text-emerald-500 dark:text-emerald-400 font-bold">○</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-white">Entrada</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Lançar pagamento ou sinal recebido
                </p>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Receita
            </span>
          </button>

          {/* Option 3: Saída */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('expense', selectedDate);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all group ${
              isLight
                ? 'bg-zinc-50/70 hover:bg-red-50 border-zinc-200 hover:border-red-400'
                : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/80 hover:border-red-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg text-red-500 font-bold">○</span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-white">Saída</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Lançar despesa de tintas, peças ou insumos
                </p>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
              Despesa
            </span>
          </button>

          {/* Option 4: Adicionar Cliente */}
          <button
            type="button"
            onClick={() => {
              onSelectAction('add-client', selectedDate);
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all group ${
              isLight
                ? 'bg-zinc-50/70 hover:bg-cyan-50 border-zinc-200 hover:border-cyan-400'
                : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/80 hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg text-emerald-500 dark:text-emerald-400 font-bold">○</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                  Adicionar Cliente
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Cadastrar novo cliente na lista
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-700 text-zinc-200'
              }`}
            >
              Cadastro
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
