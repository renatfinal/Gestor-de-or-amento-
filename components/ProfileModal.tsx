'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { formatPhone } from '@/lib/formatters';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
  theme: 'light-cyan' | 'dark-spring';
}

export function ProfileModal({
  isOpen,
  profile,
  onSaveProfile,
  onClose,
  theme,
}: ProfileModalProps) {
  const isLight = theme === 'light-cyan';

  // Form Fields initialized directly from props
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [password, setPassword] = useState(profile.password || '');
  const [confirmPassword, setConfirmPassword] = useState(profile.password || '');
  const [workshopName, setWorkshopName] = useState(profile.workshopName || 'JL Automotive & Pintura');
  const [workshopAddress, setWorkshopAddress] = useState(profile.workshopAddress || '');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Requirement: Ao preencher o telefone separado como o ex (xx) xxxxx-xxxx
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu Nome Completo.');
      return;
    }
    if (password && password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Verifique a confirmação de senha.');
      return;
    }

    const updated: UserProfile = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: password,
      workshopName: workshopName.trim(),
      workshopAddress: workshopAddress.trim(),
    };

    onSaveProfile(updated);
    setSuccessMessage('Perfil atualizado com sucesso!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-lg rounded-2xl md:rounded-3xl shadow-2xl border p-6 md:p-7 overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Requirement: X para sair da pagina caso necessario */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Fechar página (X)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div
            className={`p-3 rounded-2xl ${
              isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-950/80 text-emerald-400'
            }`}
          >
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Perfil do Usuário
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Gerencie seus dados de acesso e da oficina JL Automotive
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Nome completo */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Marcos Silva"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                    : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                }`}
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Telefone: Ao preencher o telefone separado como o ex (xx) xxxxx-xxxx */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Telefone</span>
              <span className="text-[10px] text-zinc-400">Padrão: (xx) xxxxx-xxxx</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                inputMode="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(xx) xxxxx-xxxx"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm font-mono border focus:outline-hidden transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                    : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                }`}
              />
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@oficina.com.br"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                    : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                }`}
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Senha e Confirmar senha */}
          {/* Requirement: Ao digitar perfil aparecer teclado para digitar telefone, senha e confirmar senha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  inputMode="text"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
                <ShieldCheck className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Nome da Oficina (JL Automotive) */}
          <div className="pt-1">
            <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
              Nome da Oficina
            </label>
            <input
              type="text"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              placeholder="JL Automotive & Pintura Automotiva"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all ${
                isLight
                  ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-zinc-900'
                  : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
              }`}
            />
          </div>

          {/* Requirement: Botões salvar e fechar */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                isLight
                  ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Fechar
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
  );
}
