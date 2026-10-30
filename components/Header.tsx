'use client';

import React from 'react';
import {
  Sun,
  Moon,
  User,
  Wrench,
  Palette,
  Car,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '@/lib/types';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  profile: UserProfile;
  totalBudgets: number;
}

export function Header({
  theme,
  onToggleTheme,
  onOpenProfile,
  profile,
  totalBudgets,
}: HeaderProps) {
  const isLight = theme === 'light-cyan';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/95 border-zinc-200/80 text-zinc-900 shadow-xs'
          : 'bg-black/90 border-zinc-800 text-zinc-100 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Logo: JL Automotive */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border transition-all ${
              isLight
                ? 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white border-cyan-400/40 shadow-cyan-500/20'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-black border-emerald-400/50 shadow-emerald-500/20'
            }`}
          >
            <div className="flex flex-col items-center leading-none">
              <span className="text-xs font-black tracking-tighter">JL</span>
              <Car className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight leading-none text-black dark:text-white">
                JL Automotive
              </h1>
              <span
                className={`hidden sm:inline-block text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full ${
                  isLight
                    ? 'bg-cyan-100 text-cyan-950 border border-cyan-300'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                }`}
              >
                Pintura & Estufa
              </span>
            </div>
            <p className="text-[11px] font-bold text-black dark:text-zinc-400 mt-0.5 hidden xs:block">
              Oficina Especializada em Pintura & Reparação Automotiva
            </p>
          </div>
        </div>

        {/* Right side controls: Theme Switcher & Profile button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme switcher: Claro com Azul Ciano vs Escuro com Preto & Verde Primavera */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all shadow-xs ${
              isLight
                ? 'bg-cyan-100/90 border-cyan-400 text-black hover:bg-cyan-200'
                : 'bg-zinc-900 border-zinc-700 text-emerald-400 hover:bg-zinc-800 hover:border-emerald-500/60'
            }`}
            title={
              isLight
                ? 'Ativar Modo Escuro (Preto & Verde Primavera)'
                : 'Ativar Modo Claro (Azul Ciano)'
            }
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-cyan-800" />
                <span className="hidden md:inline text-black">Claro (Azul Ciano)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Escuro (Preto & Verde)</span>
              </>
            )}
          </button>

          {/* Profile button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isLight
                ? 'border-zinc-400 bg-white hover:bg-zinc-100 text-black shadow-xs'
                : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
            }`}
            title="Acessar Perfil"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                isLight ? 'bg-cyan-200 text-black' : 'bg-emerald-950 text-emerald-300'
              }`}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline font-bold text-xs text-black dark:text-zinc-200">
              {profile.name.split(' ')[0] || 'Perfil'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
