'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Budget, FinancialTransaction } from '@/lib/types';
import { DayActionModal } from './DayActionModal';

interface CalendarViewProps {
  budgets: Budget[];
  transactions: FinancialTransaction[];
  onOpenNewBudget: (presetDate?: string) => void;
  onOpenFinancialEntry: (presetDate?: string) => void;
  onOpenFinancialExpense: (presetDate?: string) => void;
  onOpenAddClient: () => void;
  theme: 'light-cyan' | 'dark-spring';
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarView({
  budgets,
  transactions,
  onOpenNewBudget,
  onOpenFinancialEntry,
  onOpenFinancialExpense,
  onOpenAddClient,
  theme,
}: CalendarViewProps) {
  const isLight = theme === 'light-cyan';

  // Today is based on current system time (2026)
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState<boolean>(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Year navigation
  const handlePrevYear = () => {
    setCurrentYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((y) => y + 1);
  };

  // Generate 20 years back and 10 forward based on today's reference year
  const baseYear = today.getFullYear();
  const yearsList: number[] = [];
  for (let y = baseYear - 20; y <= baseYear + 10; y++) {
    yearsList.push(y);
  }

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  // Helper to check if a specific day is today
  const isCurrentToday = (day: number, isCurrentMonthDay: boolean) => {
    if (!isCurrentMonthDay) return false;
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Format date helper for comparison
  const getDayIso = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Handler when clicking a day on the calendar
  const handleDayClick = (day: number, isCurrentMonthDay: boolean) => {
    if (!isCurrentMonthDay) return;
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDayForModal(clickedDate);
  };

  // Actions from day modal
  const handleSelectDayAction = (
    action: 'budget' | 'entry' | 'expense' | 'add-client',
    date: Date
  ) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const brDate = `${dd}/${mm}/${yyyy}`;
    const isoDate = `${yyyy}-${mm}-${dd}`;

    if (action === 'budget') {
      onOpenNewBudget(brDate);
    } else if (action === 'entry') {
      onOpenFinancialEntry(isoDate);
    } else if (action === 'expense') {
      onOpenFinancialExpense(isoDate);
    } else if (action === 'add-client') {
      onOpenAddClient();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Calendar Bar */}
      <div
        className={`p-4 md:p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-zinc-200/90 shadow-sm'
            : 'bg-zinc-900 border-zinc-800 shadow-xl'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon
                className={`w-5 h-5 ${isLight ? 'text-cyan-700' : 'text-emerald-400'}`}
              />
              <h2 className="text-xl font-black tracking-tight text-black dark:text-white">
                Calendário da Oficina
              </h2>
            </div>
            <p className="text-xs font-bold text-zinc-950 dark:text-zinc-400 mt-1">
              Dia atual destacado em <span className="font-extrabold text-emerald-800 dark:text-emerald-400">verde claro</span>. Clique em qualquer data para abrir opções rápidas.
            </p>
          </div>

          {/* Month & Year Navigation Boxes requested by user */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Caixinha onde vai ficar os meses */}
            <div
              className={`flex items-center rounded-xl border px-2 py-1 shadow-xs ${
                isLight
                  ? 'bg-white border-zinc-400 shadow-xs'
                  : 'bg-zinc-800/90 border-zinc-700'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Mês Anterior"
                className="p-1.5 rounded-lg text-black hover:text-cyan-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition-colors font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMonthPickerOpen(true)}
                className="px-3 py-1 font-black text-sm hover:underline flex items-center gap-1.5 text-black dark:text-zinc-100"
                title="Trocar Mês"
              >
                <span>{MONTH_NAMES[currentMonth]}</span>
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                title="Próximo Mês"
                className="p-1.5 rounded-lg text-black hover:text-cyan-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition-colors font-bold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Caixinha para o ano com botões para voltar e passar */}
            <div
              className={`flex items-center rounded-xl border px-2 py-1 shadow-xs ${
                isLight
                  ? 'bg-white border-zinc-400 shadow-xs'
                  : 'bg-zinc-800/90 border-zinc-700'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevYear}
                title="Ano Anterior"
                className="p-1.5 rounded-lg text-black hover:text-cyan-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition-colors font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsYearPickerOpen(true)}
                className={`px-3 py-1 font-black text-sm rounded-md transition-colors ${
                  isLight
                    ? 'text-black hover:bg-cyan-50'
                    : 'text-emerald-400 hover:bg-emerald-950/40'
                }`}
                title="Clique para escolher ano (-20 até +10 anos)"
              >
                <span>{currentYear}</span>
              </button>

              <button
                type="button"
                onClick={handleNextYear}
                title="Próximo Ano"
                className="p-1.5 rounded-lg text-black hover:text-cyan-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition-colors font-bold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick button to return to today */}
            <button
              type="button"
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                isLight
                  ? 'border-zinc-400 bg-white text-black hover:bg-zinc-100 shadow-xs'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mt-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {WEEK_DAYS.map((dayName, idx) => (
              <div
                key={dayName}
                className={`text-center py-2 text-xs font-black uppercase tracking-wider ${
                  idx === 0 || idx === 6
                    ? isLight
                      ? 'text-zinc-900'
                      : 'text-zinc-500'
                    : isLight
                    ? 'text-black'
                    : 'text-zinc-300'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Previous month filler days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = prevMonthTotalDays - firstDayOfMonth + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[70px] md:min-h-[96px] p-1.5 rounded-xl opacity-25 border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col justify-start text-zinc-400 select-none"
                >
                  <span className="text-xs font-medium">{dayNum}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = isCurrentToday(day, true);
              const dayIso = getDayIso(currentYear, currentMonth, day);

              // Find budgets with deadline or created on this day
              const dayBudgets = budgets.filter((b) => {
                const deadlineIso = b.deadlineDate ? b.deadlineDate.split('/').reverse().join('-') : '';
                const createdIso = b.createdAt ? b.createdAt.slice(0, 10) : '';
                return deadlineIso === dayIso || createdIso === dayIso;
              });

              // Find financial transactions on this day
              const dayTransactions = transactions.filter((t) => t.date === dayIso);
              const dayEntries = dayTransactions.filter((t) => t.type === 'entrada');
              const dayExpenses = dayTransactions.filter((t) => t.type === 'saida');

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day, true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDayClick(day, true);
                    }
                  }}
                  className={`group relative min-h-[75px] md:min-h-[102px] p-2 rounded-xl md:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isLight
                      ? 'bg-zinc-50/70 hover:bg-cyan-50/80 border-zinc-200 hover:border-cyan-400 hover:shadow-md'
                      : 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/60 hover:border-emerald-500 hover:shadow-lg'
                  }`}
                >
                  {/* Day Number with requested light green circle on current day */}
                  <div className="flex items-center justify-between w-full">
                    {isToday ? (
                      /* CIRCLE NA COR VERDE CLARO NO DIA ATUAL */
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-300/60 dark:bg-emerald-400/30 ring-2 ring-emerald-600 dark:ring-emerald-400 flex items-center justify-center font-black text-xs md:text-sm text-black dark:text-emerald-200 shadow-sm">
                        {day}
                      </div>
                    ) : (
                      <span className={`text-xs md:text-sm font-black px-1 ${
                        isLight ? 'text-black' : 'text-zinc-300 group-hover:text-white'
                      }`}>
                        {day}
                      </span>
                    )}

                    {/* Quick "+" indicator on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full text-black hover:text-cyan-800 dark:hover:text-zinc-200">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Badges / Events Preview for this day */}
                  <div className="space-y-1 w-full mt-1 overflow-hidden">
                    {dayBudgets.length > 0 && (
                      <div className={`flex items-center gap-1 text-[10px] md:text-[11px] font-black px-1.5 py-0.5 rounded-md truncate ${
                        isLight
                          ? 'bg-cyan-100 text-cyan-950 border border-cyan-300'
                          : 'bg-cyan-500/15 text-cyan-300'
                      }`}>
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {dayBudgets.length === 1
                            ? dayBudgets[0].vehicleModel
                            : `${dayBudgets.length} orçamentos`}
                        </span>
                      </div>
                    )}

                    {dayEntries.length > 0 && (
                      <div className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md truncate ${
                        isLight
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}>
                        <ArrowDownLeft className="w-3 h-3 shrink-0 text-emerald-700" />
                        <span className="truncate">
                          +R$ {dayEntries.reduce((acc, e) => acc + e.amount, 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {dayExpenses.length > 0 && (
                      <div className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md truncate ${
                        isLight
                          ? 'bg-red-100 text-red-950 border border-red-300'
                          : 'bg-red-500/15 text-red-300'
                      }`}>
                        <ArrowUpRight className="w-3 h-3 shrink-0 text-red-700" />
                        <span className="truncate">
                          -R$ {dayExpenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Janela de 20 anos para trás e 10 para frente (Modal de Seleção de Ano) */}
      {isYearPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-lg rounded-2xl shadow-2xl border p-6 max-h-[85vh] flex flex-col ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg">Selecionar Ano</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Período disponível: {baseYear - 20} até {baseYear + 10} (30 anos)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsYearPickerOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of 31 years (20 back + current + 10 forward) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 my-4 overflow-y-auto p-1 max-h-[50vh]">
              {yearsList.map((yearOption) => {
                const isSelected = yearOption === currentYear;
                const isCurrentRefYear = yearOption === baseYear;
                return (
                  <button
                    key={yearOption}
                    type="button"
                    onClick={() => {
                      setCurrentYear(yearOption);
                      setIsYearPickerOpen(false);
                    }}
                    className={`p-3 rounded-xl text-center text-sm font-semibold transition-all border ${
                      isSelected
                        ? isLight
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/30'
                          : 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : isCurrentRefYear
                        ? isLight
                          ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                          : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                        : isLight
                        ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                        : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    <span>{yearOption}</span>
                    {isCurrentRefYear && (
                      <span className="block text-[10px] opacity-80 font-normal">Atual</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsYearPickerOpen(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${
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
      )}

      {/* Janela de Seleção de Mês */}
      {isMonthPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-lg">Selecionar Mês</h3>
              <button
                type="button"
                onClick={() => setIsMonthPickerOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 my-4">
              {MONTH_NAMES.map((mName, index) => {
                const isSelected = index === currentMonth;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(index);
                      setIsMonthPickerOpen(false);
                    }}
                    className={`py-3 px-2 rounded-xl text-center text-sm font-semibold transition-all border ${
                      isSelected
                        ? isLight
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                          : 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : isLight
                        ? 'bg-zinc-50 hover:bg-cyan-50 text-zinc-800 border-zinc-200'
                        : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal when clicking any day */}
      <DayActionModal
        isOpen={selectedDayForModal !== null}
        selectedDate={selectedDayForModal}
        onClose={() => setSelectedDayForModal(null)}
        onSelectAction={handleSelectDayAction}
        theme={theme}
      />
    </div>
  );
}
