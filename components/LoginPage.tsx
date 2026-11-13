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
import { authenticateWithDb, signInWithGoogleOAuth } from '@/lib/cloudSync';

interface LoginPageProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  profile: UserProfile;
  onLoginSuccess: (session: AuthSession, userData?: any) => void;
  onOpenFirstAccess: () => void;
}

export function LoginPage({
  theme,
  onToggleTheme,
  profile,
  onLoginSuccess,
  onOpenFirstAccess,
}: LoginPageProps) {
  const isLight = theme !== 'dark-spring';

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
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [recoveredUser, setRecoveredUser] = useState<any | null>(null);
  const [newPasswordToSet, setNewPasswordToSet] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Handle Login submission with Cloud SQL database (strict Gmail-like cloud auth)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setLoginError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await authenticateWithDb({
        action: 'login',
        email: cleanEmail,
        password: cleanPass,
      });

      if (res.success && res.user) {
        const session: AuthSession = {
          email: (res.user.email || cleanEmail).trim().toLowerCase(),
          name: res.user.name || 'JL Automotive',
          loggedInAt: new Date().toISOString(),
        };
        onLoginSuccess(session, res.user);
        setIsLoginModalOpen(false);
      } else {
        setLoginError(
          res.error ||
            'E-mail ou senha incorretos. Verifique suas credenciais ou use "Esqueci minha Senha".'
        );
      }
    } catch (dbErr: any) {
      setLoginError(
        dbErr?.message ||
          'Não foi possível conectar ao servidor na nuvem. Verifique sua internet e tente novamente.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await signInWithGoogleOAuth();
      if (result.success && result.session) {
        onLoginSuccess(result.session, result.user);
        setIsLoginModalOpen(false);
      } else {
        setLoginError(result.error || 'Não foi possível autenticar com o Google.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Erro no login com Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Forgot Password submit - Queries Cloud SQL directly
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setResetSuccessMessage(null);
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean) {
      setForgotError('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authenticateWithDb({
        action: 'forgot-password',
        email: clean,
      });

      if (res.success && res.user) {
        setRecoveredUser(res.user);
        setForgotSuccess(true);
      } else {
        setForgotError(
          res.error || 'Nenhuma conta encontrada com este e-mail no banco de dados.'
        );
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Erro de conexão com o banco de dados.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Redefining Password directly in Database
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordToSet.trim() || !recoveredUser?.email) return;

    setIsResettingPassword(true);
    setForgotError(null);
    try {
      const res = await authenticateWithDb({
        action: 'reset-password',
        email: recoveredUser.email,
        password: newPasswordToSet.trim(),
      });
      if (res.success) {
        setRecoveredUser({
          ...recoveredUser,
          password: newPasswordToSet.trim(),
        });
        setResetSuccessMessage('Senha atualizada com sucesso no banco de dados!');
        setNewPasswordToSet('');
      } else {
        setForgotError(res.error || 'Não foi possível redefinir a senha.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Erro ao redefinir senha.');
    } finally {
      setIsResettingPassword(false);
    }
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
            isLight ? 'bg-emerald-300' : 'bg-[#00FF7F]'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isLight ? 'bg-emerald-400' : 'bg-emerald-600'
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
                ? 'bg-[#00FF7F] text-black border-emerald-400 font-black shadow-emerald-500/20'
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
              <Moon className="w-4 h-4 text-emerald-800" />
              <span className="text-xs font-bold text-black">Modo Escuro</span>
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
              ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-emerald-950/10'
              : 'bg-zinc-950/90 border-zinc-800/90 text-white shadow-black/80'
          }`}
        >
          {/* Logo badge with Car icon */}
          <div className="flex justify-center mb-5">
            <div
              className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center p-3 shadow-xl border relative transition-transform hover:scale-105 ${
                isLight
                  ? 'bg-[#00FF7F] text-black border-emerald-400 font-black shadow-emerald-400/30'
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
                    ? 'bg-emerald-600 border-white'
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
                ? 'bg-white border-zinc-200 text-zinc-900 shadow-emerald-950/15'
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
                  isLight ? 'bg-emerald-100 text-emerald-950 font-black' : 'bg-emerald-950/80 text-[#00FF7F]'
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
                        ? 'bg-zinc-50 border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-zinc-900'
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
                        ? 'text-emerald-700 hover:text-emerald-900'
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
                        ? 'bg-zinc-50 border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-zinc-900'
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

              {/* Informação de sincronização em nuvem */}
              <div
                className={`p-2.5 rounded-xl text-[11px] flex items-center justify-between gap-2 border ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-400'
                }`}
              >
                <span>Seus orçamentos e eventos ficam salvos na nuvem vinculados ao seu e-mail.</span>
              </div>

              {/* Divisor com opção Google */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className={`px-2 ${isLight ? 'bg-white text-zinc-400' : 'bg-zinc-900 text-zinc-500'}`}>
                    ou acesse com
                  </span>
                </div>
              </div>

              {/* Botão Entrar com Google (OAuth) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 shadow-xs'
                    : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-white'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Conta Google</span>
              </button>

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
              onClick={() => {
                setIsForgotModalOpen(false);
                setForgotSuccess(false);
                setForgotError(null);
                setRecoveredUser(null);
                setResetSuccessMessage(null);
              }}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`p-2.5 rounded-xl ${
                  isLight ? 'bg-emerald-100 text-emerald-950 font-bold' : 'bg-zinc-800 text-[#00FF7F]'
                }`}
              >
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Recuperar Credenciais</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Consulte ou redefina sua senha cadastrada
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            {forgotSuccess && recoveredUser ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Conta Localizada no Banco de Dados!</p>
                    <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                      Você pode entrar imediatamente com esta conta ou redefinir a senha.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-1.5 border ${
                    isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px] border-b pb-1 border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500 font-medium">Nome:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{recoveredUser.name || 'JL Automotive'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-b pb-1 border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500 font-medium">E-mail:</span>
                    <span className="font-bold font-mono text-zinc-900 dark:text-white">{recoveredUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-0.5">
                    <span className="text-zinc-500 font-medium">Sua Senha Atual:</span>
                    <span className="font-black font-mono text-sm px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {recoveredUser.password || 'admin'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEmail(recoveredUser.email);
                    setPassword(recoveredUser.password || '');
                    setIsForgotModalOpen(false);
                    // Automatic login with retrieved credentials
                    const session: AuthSession = {
                      email: recoveredUser.email,
                      name: recoveredUser.name || 'JL Automotive',
                      loggedInAt: new Date().toISOString(),
                    };
                    onLoginSuccess(session, recoveredUser);
                    setIsLoginModalOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-[#00FF7F] text-black shadow-md hover:bg-[#00e672] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar agora com esta conta</span>
                </button>

                {/* Opção para Redefinir Senha */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-2">
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                      Deseja criar uma nova senha para esta conta?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPasswordToSet}
                        onChange={(e) => setNewPasswordToSet(e.target.value)}
                        placeholder="Digite nova senha"
                        className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-hidden ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                            : 'bg-zinc-800 border-zinc-700 text-white'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={isResettingPassword || !newPasswordToSet.trim()}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-white dark:bg-zinc-700 hover:bg-zinc-900 disabled:opacity-50 cursor-pointer"
                      >
                        {isResettingPassword ? 'Salvando...' : 'Atualizar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Digite seu e-mail para localizar sua conta e senha no banco de dados da oficina:
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="ex: renatof.rcc@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-hidden ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      : 'bg-zinc-800 border-zinc-700 text-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-[#00FF7F] text-black shadow-md hover:bg-[#00e672] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Consultar Senha no Banco de Dados</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
