'use client';

import React, { useState } from 'react';
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '@/lib/types';
import { AuthSession } from '@/lib/storage';

interface LoginPageProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  profile: UserProfile;
  onLoginSuccess: (session: AuthSession) => void;
  onOpenFirstAccess: () => void;
}

export function LoginPage({
  theme,
  onToggleTheme,
  profile,
  onLoginSuccess,
  onOpenFirstAccess,
}: LoginPageProps) {
  const isLight = theme === 'light-cyan';

  // Modal "Acessar App" state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // "Esqueci minha Senha" state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setLoginError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoggingIn(true);

    // Validate credentials against current saved profile or fallback defaults
    const profileEmail = (profile.email || 'jl.automotive@gmail.com').toLowerCase();
    const profilePass = profile.password || 'admin';

    // Allow login if matches profile or master demo account
    const isMasterMatch =
      cleanEmail === 'jl.automotive@gmail.com' && (cleanPass === 'admin' || cleanPass === profilePass);
    const isProfileMatch = cleanEmail === profileEmail && cleanPass === profilePass;

    setTimeout(() => {
      if (isMasterMatch || isProfileMatch || cleanPass === profilePass) {
        const session: AuthSession = {
          email: cleanEmail,
          name: profile.name || 'JL Automotive',
          loggedInAt: new Date().toISOString(),
        };
        onLoginSuccess(session);
        setIsLoginModalOpen(false);
      } else {
        setLoginError('E-mail ou senha incorretos. Verifique suas credenciais ou use "Esqueci minha Senha".');
        setIsLoggingIn(false);
      }
    }, 400);
  };

  // Quick fill helper for easy testing
  const handleQuickFillDemo = () => {
    setEmail(profile.email || 'jl.automotive@gmail.com');
    setPassword(profile.password || 'admin');
    setLoginError(null);
  };

  // Handle Forgot Password submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
  };

  // Helper to ensure input scrolls smoothly into view on mobile keyboard
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors relative overflow-hidden select-none ${
        isLight
          ? 'bg-zinc-100 text-zinc-900'
          : 'bg-[#0a0d0f] text-zinc-100'
      }`}
    >
      {/* Background visual accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
            isLight ? 'bg-cyan-400' : 'bg-[#00FF7F]'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isLight ? 'bg-blue-400' : 'bg-emerald-600'
          }`}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top Bar with Brand & Theme Switcher */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-md border ${
              isLight
                ? 'bg-cyan-600 text-white border-cyan-400/40 shadow-cyan-600/20'
                : 'bg-[#00FF7F] text-black border-[#00FF7F]/60 shadow-[#00FF7F]/20'
            }`}
          >
            <span className="text-sm font-black tracking-tight">JL</span>
          </div>
          <div>
            <span className="font-black text-sm tracking-tight block">JL Automotive</span>
            <span className="text-[10px] text-zinc-500 font-semibold block -mt-0.5">
              Funilaria & Pintura
            </span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-xs ${
            isLight
              ? 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-50'
              : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700'
          }`}
          title="Alternar tema"
        >
          {isLight ? (
            <>
              <Moon className="w-4 h-4 text-cyan-600" />
              <span className="text-xs">Modo Escuro</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-[#00FF7F]" />
              <span className="text-xs">Modo Claro</span>
            </>
          )}
        </button>
      </header>

      {/* Central Login Hero / Portal Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div
          className={`w-full max-w-md rounded-3xl p-7 sm:p-9 border shadow-2xl backdrop-blur-xl transition-all text-center ${
            isLight
              ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-cyan-950/10'
              : 'bg-zinc-950/90 border-zinc-800/90 text-white shadow-black/80'
          }`}
        >
          {/* Logo badge with Car icon */}
          <div className="flex justify-center mb-5">
            <div
              className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center p-3 shadow-xl border relative transition-transform hover:scale-105 ${
                isLight
                  ? 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white border-cyan-300/40 shadow-cyan-600/30'
                  : 'bg-gradient-to-br from-zinc-900 to-black text-[#00FF7F] border-[#00FF7F]/40 shadow-[#00FF7F]/20'
              }`}
            >
              <Car className="w-9 h-9 stroke-[2.2]" />
              <span className="text-[10px] font-black tracking-widest uppercase mt-0.5">
                JL AUTO
              </span>
              <span
                className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                  isLight
                    ? 'bg-emerald-400 border-white'
                    : 'bg-[#00FF7F] border-black animate-pulse'
                }`}
              />
            </div>
          </div>

          {/* Nome da Empresa: JL Automotive */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            JL Automotive
          </h1>

          {/* Mensagem solicitada: (Gestor de Orçamentos e controle para Empresas ) */}
          <p className="mt-2 text-sm sm:text-base font-semibold text-zinc-600 dark:text-zinc-300 px-2 leading-snug">
            Gestor de Orçamentos e controle para Empresas
          </p>

          <div
            className={`my-6 border-t ${
              isLight ? 'border-zinc-200' : 'border-zinc-800/80'
            }`}
          />

          {/* Botões de Ação */}
          <div className="space-y-3.5">
            {/* Requirement: Um botão escrito ( Entrar) em verde Primavera */}
            <button
              type="button"
              onClick={() => {
                setLoginError(null);
                setIsLoginModalOpen(true);
              }}
              style={{
                backgroundColor: '#00FF7F',
                color: '#000000',
              }}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg shadow-[#00FF7F]/30 hover:shadow-[#00FF7F]/50 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Entrar</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Requirement: E outro botão menor para Primeiro Acesso Onde vai para janela do perfil para criar um perfil para acessar o app */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenFirstAccess}
                className={`inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900'
                    : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
                title="Cadastre seu perfil para primeiro acesso"
              >
                <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Primeiro Acesso</span>
              </button>
            </div>
          </div>

          {/* Multi-device access badge */}
          <div
            className={`mt-7 pt-5 border-t flex items-center justify-center gap-2 text-[11px] font-medium ${
              isLight
                ? 'border-zinc-200 text-zinc-500'
                : 'border-zinc-800/80 text-zinc-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Acesse de qualquer dispositivo com seu e-mail e senha</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-zinc-500">
        <p>JL Automotive © 2026 • Sistema de Gestão e Pintura Automotiva</p>
      </footer>

      {/* ========================================================================= */}
      {/* Requirement: Ao apertar o botão Entrar, abrir uma janela (Acessar App )   */}
      {/* Com campo para e-mail E outro para Senha e um acesso pequeno para esqueci minha Senha. */}
      {/* ========================================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border p-5 sm:p-7 my-auto transition-all ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900 shadow-cyan-950/15'
                : 'bg-zinc-900 border-zinc-800 text-white shadow-black'
            }`}
          >
            {/* Botão X para fechar a janela */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Fechar (X)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho da janela */}
            <div className="flex items-center gap-3 mb-5 pr-8">
              <div
                className={`p-2.5 sm:p-3 rounded-2xl ${
                  isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-950/80 text-[#00FF7F]'
                }`}
              >
                <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Acessar App
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                  Informe suas credenciais para entrar no sistema
                </p>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Campo E-mail */}
              <div className="scroll-mt-20">
                <label className="block text-xs font-bold mb-1 text-zinc-700 dark:text-zinc-300">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    inputMode="email"
                    required
                    value={email}
                    onFocus={handleInputFocus}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: seu.email@empresa.com"
                    className={`w-full pl-9 pr-3.5 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm border focus:outline-hidden transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                        : 'bg-zinc-800/80 border-zinc-700 focus:border-[#00FF7F] focus:ring-2 focus:ring-[#00FF7F]/20 text-white'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 sm:top-3" />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="scroll-mt-20">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Senha
                  </label>
                  {/* Requirement: e um acesso pequeno para esqueci minha Senha */}
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSuccess(false);
                      setIsForgotModalOpen(true);
                    }}
                    className={`text-[11px] font-semibold underline underline-offset-2 transition-colors cursor-pointer ${
                      isLight
                        ? 'text-cyan-700 hover:text-cyan-900'
                        : 'text-[#00FF7F] hover:text-[#00e672]'
                    }`}
                  >
                    Esqueci minha Senha
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="text"
                    required
                    value={password}
                    onFocus={handleInputFocus}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm border focus:outline-hidden transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                        : 'bg-zinc-800/80 border-zinc-700 focus:border-[#00FF7F] focus:ring-2 focus:ring-[#00FF7F]/20 text-white'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 sm:top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 sm:top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dica rápida para preenchimento fácil / demonstração */}
              <div
                className={`p-2.5 rounded-xl text-[11px] flex items-center justify-between gap-2 border ${
                  isLight
                    ? 'bg-cyan-50/70 border-cyan-200 text-cyan-900'
                    : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-400'
                }`}
              >
                <span>Dica: Conta de acesso rápido</span>
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className={`text-[11px] font-black underline cursor-pointer ${
                    isLight ? 'text-cyan-800' : 'text-[#00FF7F]'
                  }`}
                >
                  Preencher dados
                </button>
              </div>

              {/* Botões da Janela Acessar App */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  style={{
                    backgroundColor: '#00FF7F',
                    color: '#000000',
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-black shadow-md shadow-[#00FF7F]/30 hover:shadow-[#00FF7F]/50 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                      <span>Acessar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal / Janela: "Recuperação de Senha" (Esqueci minha Senha)               */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 transition-all ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900'
                : 'bg-zinc-900 border-zinc-800 text-white'
            }`}
          >
            <button
              onClick={() => setIsForgotModalOpen(false)}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`p-2.5 rounded-xl ${
                  isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-zinc-800 text-[#00FF7F]'
                }`}
              >
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black">Recuperar Senha</h3>
            </div>

            {forgotSuccess ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Instruções enviadas!</p>
                    <p className="mt-0.5">
                      Verifique sua caixa de entrada no e-mail: <strong>{forgotEmail || profile.email}</strong>.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <p className="font-bold text-[11px] text-zinc-400 uppercase">Credencial cadastrada neste dispositivo:</p>
                  <p>E-mail: <strong>{profile.email || 'jl.automotive@gmail.com'}</strong></p>
                  <p>Senha configurada: <strong className="font-mono text-emerald-500">{profile.password || 'admin'}</strong></p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEmail(profile.email || 'jl.automotive@gmail.com');
                    setPassword(profile.password || 'admin');
                    setIsForgotModalOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#00FF7F] text-black shadow-md cursor-pointer"
                >
                  Usar esta senha para Entrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Digite seu e-mail cadastrado para receber instruções de acesso:
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-hidden ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      : 'bg-zinc-800 border-zinc-700 text-white'
                  }`}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#00FF7F] text-black shadow-md cursor-pointer"
                >
                  Enviar Instruções
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
