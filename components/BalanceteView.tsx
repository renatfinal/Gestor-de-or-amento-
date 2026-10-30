'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { FinancialTransaction } from '@/lib/types';
import { formatBRL } from '@/lib/formatters';

interface BalanceteViewProps {
  transactions: FinancialTransaction[];
  theme: 'light-cyan' | 'dark-spring';
}

const MONTHS_LIST = [
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

export function BalanceteView({ transactions, theme }: BalanceteViewProps) {
  const isLight = theme === 'light-cyan';
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Compute month-by-month figures
  const monthlyData = MONTHS_LIST.map((name, monthIndex) => {
    const monthTransactions = transactions.filter((t) => {
      if (!t.date) return false;
      const [yStr, mStr] = t.date.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      return y === selectedYear && m === monthIndex;
    });

    const entrada = monthTransactions
      .filter((t) => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);

    const saida = monthTransactions
      .filter((t) => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);

    const total = entrada - saida;

    return {
      monthName: name,
      monthIndex,
      entrada,
      saida,
      total,
      count: monthTransactions.length,
    };
  });

  // Balancete Anual totals
  const totalAnualEntrada = monthlyData.reduce((acc, m) => acc + m.entrada, 0);
  const totalAnualSaida = monthlyData.reduce((acc, m) => acc + m.saida, 0);
  const totalAnualLiquido = totalAnualEntrada - totalAnualSaida;
  const margemLucro = totalAnualEntrada > 0
    ? Math.round((totalAnualLiquido / totalAnualEntrada) * 100)
    : 0;

  // Max value for bar visual scale
  const maxBarValue = Math.max(
    ...monthlyData.map((m) => Math.max(m.entrada, m.saida)),
    1000
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Ano Selecionado & Balancete Anual */}
      <div
        className={`p-6 rounded-2xl md:rounded-3xl border transition-all ${
          isLight
            ? 'bg-gradient-to-br from-cyan-900 to-slate-900 text-white border-cyan-800 shadow-xl'
            : 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white border-zinc-800 shadow-2xl'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-black tracking-tight">
                Balancete Financeiro JL Automotive
              </h2>
            </div>
            <p className="text-xs text-zinc-300 mt-1">
              Demonstrativo consolidado de Entradas, Saídas e Resultado Mensal e Anual.
            </p>
          </div>

          {/* Year selector box with back and next buttons */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => y - 1)}
              title="Ano Anterior"
              className="p-1 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono font-bold text-sm px-2">
              Ano Selecionado: {selectedYear}
            </span>

            <button
              type="button"
              onClick={() => setSelectedYear((y) => y + 1)}
              title="Próximo Ano"
              className="p-1 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balancete Anual Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              Total Entrada Anual
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-1.5">
              {formatBRL(totalAnualEntrada)}
            </p>
            <span className="text-[11px] text-zinc-400">Receita bruta do ano {selectedYear}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
              Total Saída Anual
            </span>
            <p className="text-2xl font-black text-red-400 mt-1.5">
              {formatBRL(totalAnualSaida)}
            </p>
            <span className="text-[11px] text-zinc-400">Despesas & insumos em {selectedYear}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              {totalAnualLiquido >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              Resultado Anual (Total)
            </span>
            <p
              className={`text-2xl font-black mt-1.5 ${
                totalAnualLiquido >= 0 ? 'text-emerald-300' : 'text-red-400'
              }`}
            >
              {formatBRL(totalAnualLiquido)}
            </p>
            <span className="text-[11px] text-zinc-400">
              Margem líquida estimada: {margemLucro}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabela dos Meses do Ano (Janeiro a Dezembro) */}
      <div
        className={`p-5 md:p-6 rounded-2xl border overflow-hidden ${
          isLight
            ? 'bg-white border-zinc-200/90 shadow-sm text-zinc-900'
            : 'bg-zinc-900 border-zinc-800 shadow-xl text-zinc-100'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Layers className={`w-5 h-5 ${isLight ? 'text-cyan-600' : 'text-emerald-400'}`} />
              Demonstrativo Mensal ({selectedYear})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Todos os meses do ano: Entrada, Saída e Total
            </p>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                className={`text-xs uppercase tracking-wider border-b ${
                  isLight
                    ? 'bg-zinc-50/70 border-zinc-200 text-zinc-500'
                    : 'bg-zinc-800/50 border-zinc-800 text-zinc-400'
                }`}
              >
                <th className="py-3 px-4 font-bold">Mês</th>
                <th className="py-3 px-4 font-bold text-right text-emerald-600 dark:text-emerald-400">
                  Entrada (R$)
                </th>
                <th className="py-3 px-4 font-bold text-right text-red-600 dark:text-red-400">
                  Saída (R$)
                </th>
                <th className="py-3 px-4 font-bold text-right">Total / Saldo (R$)</th>
                <th className="py-3 px-4 font-bold text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {monthlyData.map((row) => {
                const isPositive = row.total >= 0;
                const hasTransactions = row.entrada > 0 || row.saida > 0;

                return (
                  <tr
                    key={row.monthName}
                    className={`transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {row.monthName}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">
                      {formatBRL(row.entrada)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-right text-red-600 dark:text-red-400">
                      {formatBRL(row.saida)}
                    </td>

                    <td
                      className={`py-3.5 px-4 font-mono font-black text-right ${
                        row.total > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : row.total < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {formatBRL(row.total)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {!hasTransactions ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                          Sem movimento
                        </span>
                      ) : isPositive ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Lucro
                        </span>
                      ) : (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-semibold inline-flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Déficit
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr
                className={`font-black text-sm border-t-2 ${
                  isLight
                    ? 'border-zinc-300 bg-zinc-50/90 text-zinc-900'
                    : 'border-zinc-700 bg-zinc-800/90 text-white'
                }`}
              >
                <td className="py-4 px-4 uppercase tracking-wider">Balancete Anual Total</td>
                <td className="py-4 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400">
                  {formatBRL(totalAnualEntrada)}
                </td>
                <td className="py-4 px-4 font-mono text-right text-red-600 dark:text-red-400">
                  {formatBRL(totalAnualSaida)}
                </td>
                <td
                  className={`py-4 px-4 font-mono text-right ${
                    totalAnualLiquido >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatBRL(totalAnualLiquido)}
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      totalAnualLiquido >= 0
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {totalAnualLiquido >= 0 ? 'Resultado Positivo' : 'Resultado Negativo'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Gráfico Comparativo Visual Entrada vs Saída */}
      <div
        className={`p-5 md:p-6 rounded-2xl border ${
          isLight
            ? 'bg-white border-zinc-200/90 shadow-sm'
            : 'bg-zinc-900 border-zinc-800 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            Comparativo Visual de Desempenho Mensal
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
              <span className="text-zinc-500">Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-red-500 inline-block"></span>
              <span className="text-zinc-500">Saídas</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-1 sm:gap-2 h-44 items-end pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {monthlyData.map((m) => {
            const hEntrada = Math.round((m.entrada / maxBarValue) * 100);
            const hSaida = Math.round((m.saida / maxBarValue) * 100);

            return (
              <div
                key={m.monthName}
                className="flex flex-col items-center justify-end h-full gap-1 group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-zinc-900 text-white text-[10px] p-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                  <span>{m.monthName}</span>
                  <span className="text-emerald-400 font-mono">+{formatBRL(m.entrada)}</span>
                  <span className="text-red-400 font-mono">-{formatBRL(m.saida)}</span>
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-32">
                  <div
                    style={{ height: `${Math.max(hEntrada, 4)}%` }}
                    className="w-1/2 rounded-t-sm bg-emerald-500 transition-all group-hover:brightness-110"
                    title={`Entrada: ${formatBRL(m.entrada)}`}
                  />
                  <div
                    style={{ height: `${Math.max(hSaida, 4)}%` }}
                    className="w-1/2 rounded-t-sm bg-red-500 transition-all group-hover:brightness-110"
                    title={`Saída: ${formatBRL(m.saida)}`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold truncate w-full text-center">
                  {m.monthName.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
