'use client';

import React from 'react';
import {
  FilePlus,
  Users,
  ArrowUpDown,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { ActiveTab, ThemeMode } from '@/lib/types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewBudget: () => void;
  theme: ThemeMode;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  onOpenNewBudget,
  theme,
}: BottomNavProps) {
  const isLight = theme === 'light-cyan';

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-2 sm:p-4 pointer-events-none">
      <nav
        className={`max-w-3xl mx-auto rounded-2xl md:rounded-3xl border shadow-2xl backdrop-blur-lg pointer-events-auto p-1.5 sm:p-2 transition-all ${
          isLight
            ? 'bg-white/95 border-zinc-200/90 text-zinc-800 shadow-cyan-900/10'
            : 'bg-black/95 border-zinc-800 text-zinc-200 shadow-emerald-950/20'
        }`}
      >
        <div className="grid grid-cols-5 gap-1 items-center">
          {/* Calendar tab */}
          <button
            type="button"
            onClick={() => onSelectTab('calendar')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
              activeTab === 'calendar'
                ? isLight
                  ? 'bg-cyan-50 text-cyan-800 font-bold'
                  : 'bg-zinc-800/90 text-emerald-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Calendário</span>
          </button>

          {/* 1 Novo Orçamento */}
          <button
            type="button"
            onClick={onOpenNewBudget}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all group ${
              isLight
                ? 'hover:bg-cyan-50 text-cyan-700'
                : 'hover:bg-zinc-800/80 text-emerald-400'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                isLight ? 'bg-cyan-600 text-white shadow-xs' : 'bg-emerald-600 text-black shadow-xs'
              }`}
            >
              <FilePlus className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold leading-tight mt-0.5">
              Novo Orçamento
            </span>
          </button>

          {/* 2 Clientes & Orçamentos */}
          <button
            type="button"
            onClick={() => onSelectTab('clients')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
              activeTab === 'clients'
                ? isLight
                  ? 'bg-cyan-50 text-cyan-800 font-bold'
                  : 'bg-zinc-800/90 text-emerald-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Clientes</span>
          </button>

          {/* 3 Entradas & Saídas */}
          <button
            type="button"
            onClick={() => onSelectTab('financial')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
              activeTab === 'financial'
                ? isLight
                  ? 'bg-cyan-50 text-cyan-800 font-bold'
                  : 'bg-zinc-800/90 text-emerald-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpDown className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Entradas/Saídas</span>
          </button>

          {/* 4 Balancete Financeiro */}
          <button
            type="button"
            onClick={() => onSelectTab('balance')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
              activeTab === 'balance'
                ? isLight
                  ? 'bg-cyan-50 text-cyan-800 font-bold'
                  : 'bg-zinc-800/90 text-emerald-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Balancete</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
