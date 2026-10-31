'use client';

import React, { useState } from 'react';
import {
  X,
  Camera,
  Download,
  Share2,
  Save,
  Trash2,
  Eye,
  AlertCircle,
  FileCheck,
  Calendar,
  DollarSign,
  Car,
  User,
  Phone,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { Budget, BudgetStatus, VehiclePhoto } from '@/lib/types';
import { STATUS_OPTIONS, getStatusConfig } from '@/lib/statusConfig';
import {
  formatCurrencyInput,
  formatDateInput,
  formatPhone,
  formatPlate,
} from '@/lib/formatters';
import { downloadBudgetPdf, shareBudget } from '@/lib/pdfGenerator';
import { CameraCaptureModal } from './CameraCaptureModal';

interface BudgetModalProps {
  isOpen: boolean;
  initialBudget?: Budget | null;
  presetDate?: string; // DD/MM/YYYY
  onClose: () => void;
  onSave: (budget: Budget) => void;
  theme: 'light-cyan' | 'dark-spring';
}

export function BudgetModal({
  isOpen,
  initialBudget,
  presetDate,
  onClose,
  onSave,
  theme,
}: BudgetModalProps) {
  const isLight = theme === 'light-cyan';

  // Form State initialized directly from props
  const [clientName, setClientName] = useState(initialBudget?.clientName || '');
  const [phone, setPhone] = useState(initialBudget?.phone || '');
  const [vehicleModel, setVehicleModel] = useState(initialBudget?.vehicleModel || '');
  const [plate, setPlate] = useState(initialBudget?.plate || '');
  const [manufactureYear, setManufactureYear] = useState(initialBudget?.manufactureYear || '');
  const [vehicleColor, setVehicleColor] = useState(initialBudget?.vehicleColor || '');
  const [serviceDescription, setServiceDescription] = useState(initialBudget?.serviceDescription || '');
  const [notes, setNotes] = useState(initialBudget?.notes || '');
  const [formattedAmount, setFormattedAmount] = useState(initialBudget?.formattedAmount || '0,00');
  const [numericAmount, setNumericAmount] = useState(initialBudget?.amount || 0);
  const [deadlineDate, setDeadlineDate] = useState(initialBudget?.deadlineDate || presetDate || '');
  const [status, setStatus] = useState<BudgetStatus>(initialBudget?.status || 'Pendente');
  const [photos, setPhotos] = useState<VehiclePhoto[]>(initialBudget?.photos || []);

  // UI state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<VehiclePhoto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Handlers for formatted inputs
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Requirement: Em placas ao digitar sempre deixar maiusculo automaticamente.
    setPlate(formatPlate(e.target.value));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Live currency formatting e.g. 0.000,00
    const { formatted, numeric } = formatCurrencyInput(e.target.value);
    setFormattedAmount(formatted);
    setNumericAmount(numeric);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Requirement: Separar por XX/XX/XXXX.
    setDeadlineDate(formatDateInput(e.target.value));
  };

  const handleAddPhoto = (newPhoto: VehiclePhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Build current budget object inside action handlers only (pure render)
  const buildCurrentBudget = (): Budget => {
    return {
      id: initialBudget?.id || `orc_${Date.now()}`,
      clientName: clientName.trim() || 'Cliente Não Informado',
      phone: phone.trim(),
      vehicleModel: vehicleModel.trim() || 'Veículo Não Informado',
      plate: plate.trim(),
      manufactureYear: manufactureYear.trim(),
      vehicleColor: vehicleColor.trim(),
      serviceDescription: serviceDescription.trim(),
      notes: notes.trim(),
      amount: numericAmount,
      formattedAmount: formattedAmount,
      deadlineDate: deadlineDate.trim(),
      status: status,
      photos: photos,
      createdAt: initialBudget?.createdAt || new Date().toISOString(),
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Por favor, informe o Nome do Cliente.');
      return;
    }
    if (!vehicleModel.trim()) {
      setErrorMessage('Por favor, informe o Veículo (Marca/Modelo).');
      return;
    }

    const currentObj = buildCurrentBudget();
    onSave(currentObj);
    onClose();
  };

  const handleDownloadPdf = () => {
    try {
      const currentObj = buildCurrentBudget();
      downloadBudgetPdf(currentObj);
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorMessage('Erro ao gerar PDF. Verifique os dados e tente novamente.');
    }
  };

  const handleSharePdf = async () => {
    try {
      setShareFeedback('Preparando orçamento para envio...');
      const currentObj = buildCurrentBudget();
      const res = await shareBudget(currentObj);
      if (res?.success) {
        setShareFeedback('Orçamento compartilhado com sucesso!');
        setTimeout(() => setShareFeedback(null), 3500);
      } else {
        setShareFeedback(null);
      }
    } catch (err) {
      console.error('Share error:', err);
      setShareFeedback(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-4xl my-auto rounded-2xl md:rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
          isLight
            ? 'bg-white border-zinc-300 text-black'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header with Title and 'X' to close */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight
              ? 'bg-zinc-50 border-zinc-200'
              : 'bg-zinc-950/60 border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isLight ? 'bg-cyan-100 text-cyan-950 font-bold' : 'bg-emerald-950/80 text-emerald-400'
              }`}
            >
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-tight text-black dark:text-white">
                {initialBudget ? 'Alterar Andamento do Serviço & Orçamento' : 'Novo Orçamento de Pintura'}
              </h2>
              <p className="text-xs font-bold text-black dark:text-zinc-400">
                {initialBudget
                  ? 'Atualize as descrições de avarias, fotos e o status até a conclusão'
                  : 'JL Automotive • Preencha os dados e gere o orçamento profissional'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-full text-black hover:text-cyan-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
            title="Fechar (X)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-5 md:p-7 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {shareFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>{shareFeedback}</span>
            </div>
          )}

          {/* Section 1: Cliente & Contato */}
          <div className="space-y-4">
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-black' : 'text-zinc-400'
            }`}>
              <User className="w-3.5 h-3.5" />
              Identificação do Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black mb-1 text-black dark:text-zinc-300">
                  Nome do Cliente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: João da Silva Sauro"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-hidden transition-all ${
                      isLight
                        ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                        : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                    }`}
                  />
                  <User className="w-4 h-4 text-black dark:text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black mb-1 text-black dark:text-zinc-300">
                  Telefone (WhatsApp)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(XX) XXXXX-XXXX"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-all font-mono font-bold ${
                      isLight
                        ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                        : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-black dark:text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Veículo & Placas (Auto Uppercase) */}
          <div className="space-y-4 pt-2">
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-black' : 'text-zinc-400'
            }`}>
              <Car className="w-3.5 h-3.5" />
              Dados do Veículo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-xs font-black mb-1 ${
                  isLight ? 'text-black' : 'text-zinc-300'
                }`}>
                  Veículo (Marca/Modelo) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Ex: Fiat Argo 1.3 Trekking"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              {/* Requirement: Em placas ao digitar sempre deixar maiusculo automaticamente */}
              <div>
                <label className={`block text-xs font-black mb-1 flex items-center justify-between ${
                  isLight ? 'text-black' : 'text-zinc-300'
                }`}>
                  <span>Placas</span>
                  <span className={`text-[10px] font-bold ${isLight ? 'text-black' : 'text-zinc-400'}`}>Maiúsculo auto</span>
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={handlePlateChange}
                  placeholder="ABC1D23"
                  maxLength={8}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border uppercase font-mono font-black tracking-wider focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-black mb-1 ${
                  isLight ? 'text-black' : 'text-zinc-300'
                }`}>
                  Ano de Fabricação
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={manufactureYear}
                  onChange={(e) => setManufactureYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Ex: 2022"
                  maxLength={4}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              {/* Requirement: depois de Ano de Fabricação colocar uma caixinha para Cor do veículo */}
              <div>
                <label className={`block text-xs font-black mb-1 flex items-center gap-1.5 ${
                  isLight ? 'text-black' : 'text-zinc-300'
                }`}>
                  <Palette className={`w-3.5 h-3.5 ${isLight ? 'text-black' : 'text-zinc-400'}`} />
                  <span>Cor do Veículo</span>
                </label>
                <input
                  type="text"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  placeholder="Ex: Preto Metálico, Prata, Branco..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Serviços e Observações */}
          <div className="space-y-4 pt-2">
            <div>
              <label className={`block text-xs font-black mb-1 ${
                isLight ? 'text-black' : 'text-zinc-300'
              }`}>
                Serviço Solicitado / Descrição de Avarias <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Descreva o serviço: Ex: Funilaria na lateral esquerda, pintura em estufa do para-choque traseiro, polimento técnico cristalizado..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-hidden transition-all ${
                  isLight
                    ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                    : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-black mb-1 ${
                isLight ? 'text-black' : 'text-zinc-300'
              }`}>
                Observações
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Tinta original de fábrica, cliente fornecerá peças, urgência na entrega..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-hidden transition-all ${
                  isLight
                    ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                    : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                }`}
              />
            </div>
          </div>

          {/* Section 4: Valor, Previsão (XX/XX/XXXX) e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Valor do Orçamento com máscara automática */}
            <div>
              <label className={`block text-xs font-black mb-1 ${
                isLight ? 'text-black' : 'text-zinc-300'
              }`}>
                Valor do Orçamento (R$)
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-2.5 text-sm font-black ${
                  isLight ? 'text-black' : 'text-zinc-400'
                }`}>
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formattedAmount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm font-black border focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
                <DollarSign className={`w-4 h-4 absolute right-3 top-3 ${
                  isLight ? 'text-black opacity-70' : 'text-zinc-400 opacity-40'
                }`} />
              </div>
            </div>

            {/* Requirement: Previsão solicitada Separar por XX/XX/XXXX */}
            <div>
              <label className={`block text-xs font-black mb-1 ${
                isLight ? 'text-black' : 'text-zinc-300'
              }`}>
                Previsão Solicitada (XX/XX/XXXX)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={deadlineDate}
                  onChange={handleDateChange}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm border font-mono font-bold focus:outline-hidden transition-all ${
                    isLight
                      ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black placeholder:text-zinc-500'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
                <Calendar className={`w-4 h-4 absolute left-3 top-3 ${
                  isLight ? 'text-black' : 'text-zinc-400'
                }`} />
              </div>
            </div>

            {/* Status Iniciais com bolinha de cada cor em frente de cada descrição */}
            <div className="relative">
              <label className={`block text-xs font-black mb-1 ${
                isLight ? 'text-black' : 'text-zinc-300'
              }`}>
                Status Inicial <span className="text-[10px] font-normal opacity-80">(com cor identificadora)</span>
              </label>

              {/* Botão do seletor que abre as opções */}
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border flex items-center justify-between transition-all ${
                  isLight
                    ? 'bg-white border-zinc-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 text-black shadow-xs'
                    : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${getStatusConfig(status).dotBg} border ${getStatusConfig(status).dotBorder} ring-2 ${getStatusConfig(status).dotRing} shrink-0`}
                  />
                  <span className="font-black">{status}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isLight ? getStatusConfig(status).badgeBgLight : getStatusConfig(status).badgeBgDark
                  }`}>
                    {getStatusConfig(status).colorName}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu com bolinha de cada cor em frente de cada descrição */}
              {isStatusDropdownOpen && (
                <div
                  className={`absolute left-0 right-0 z-40 mt-1.5 rounded-xl border shadow-2xl p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150 ${
                    isLight
                      ? 'bg-white border-zinc-300 text-zinc-900 shadow-zinc-400/40'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-100 shadow-black/80'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 border-b border-zinc-100 dark:border-zinc-800">
                    Selecione o Status Inicial:
                  </p>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {STATUS_OPTIONS.map((st) => {
                      const cfg = getStatusConfig(st);
                      const isSelected = st === status;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatus(st);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                            isSelected
                              ? isLight
                                ? 'bg-cyan-100 text-cyan-950 font-black border border-cyan-300'
                                : 'bg-emerald-950/70 text-emerald-300 font-black border border-emerald-700/60'
                              : isLight
                              ? 'hover:bg-zinc-100 text-black'
                              : 'hover:bg-zinc-800 text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-3.5 h-3.5 rounded-full shrink-0 ${cfg.dotBg} border ${cfg.dotBorder} ring-2 ${cfg.dotRing}`}
                            />
                            <span className="font-bold">{st}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-medium hidden sm:inline ${
                              isLight ? 'text-zinc-600' : 'text-zinc-400'
                            }`}>
                              {cfg.description}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                              isLight ? cfg.badgeBgLight : cfg.badgeBgDark
                            }`}>
                              {cfg.colorName}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seletor rápido de Status com as bolinhas coloridas */}
          <div className="pt-2">
            <span className={`text-[11px] font-bold block mb-1.5 ${isLight ? 'text-black' : 'text-zinc-400'}`}>
              Bolinhas de Identificação do Estado do Serviço (clique para selecionar):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((st) => {
                const cfg = getStatusConfig(st);
                const isSelected = st === status;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                        ? isLight
                          ? 'border-cyan-600 bg-cyan-100 text-cyan-950 ring-2 ring-cyan-400/40 shadow-xs'
                          : 'border-emerald-500 bg-emerald-950/70 text-emerald-200 ring-2 ring-emerald-500/40 shadow-xs'
                        : isLight
                        ? 'border-zinc-300 bg-white hover:bg-zinc-100 text-black'
                        : 'border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${cfg.dotBg} border ${cfg.dotBorder} ring-1 ${cfg.dotRing}`} />
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Galeria de Fotos & Câmera */}
          {/* Requirement: Coloque tambem um botão com ícone de Câmera, para tirar fotos do veículo e avarias onde ficará salva em uma galeria de fotos dentro do app */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-black' : 'text-zinc-400'
                }`}>
                  <Camera className="w-3.5 h-3.5" />
                  Galeria de Fotos do Veículo & Avarias ({photos.length})
                </h3>
                <p className={`text-[11px] font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-500'}`}>
                  Fotografe peças danificadas, riscos e o antes/depois da pintura
                </p>
              </div>

              {/* Botão com ícone de Câmera */}
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs ${
                  isLight
                    ? 'bg-cyan-100 hover:bg-cyan-200 text-cyan-950 border border-cyan-400'
                    : 'bg-emerald-950/60 hover:bg-emerald-950 text-emerald-300 border border-emerald-800/70'
                }`}
              >
                <Camera className="w-4 h-4" />
                Tirar / Enviar Foto
              </button>
            </div>

            {photos.length === 0 ? (
              <div
                onClick={() => setIsCameraModalOpen(true)}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  isLight
                    ? 'border-zinc-300 hover:border-cyan-600 bg-zinc-50'
                    : 'border-zinc-800 hover:border-emerald-500 bg-zinc-900/50'
                }`}
              >
                <Camera className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-black opacity-80' : 'text-zinc-400 opacity-60'}`} />
                <p className={`text-xs font-bold ${isLight ? 'text-black' : 'text-zinc-400'}`}>
                  Nenhuma foto anexada ainda. Clique no botão de câmera para registrar avarias.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-800 bg-black aspect-square"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.dataUrl}
                      alt={item.caption || 'Avaria'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(item)}
                        title="Ver ampliada"
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(item.id)}
                        title="Excluir foto"
                        className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 px-2 py-1 text-[10px] text-white truncate font-bold">
                        {item.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Toolbar at bottom */}
          <div
            className={`pt-5 mt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
              isLight ? 'border-zinc-300' : 'border-zinc-800'
            }`}
          >
            {/* Left side: PDF Download and Share */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Botão de baixar em PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isLight
                    ? 'border-zinc-400 bg-white hover:bg-zinc-100 text-black shadow-xs'
                    : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
                title="Baixar Orçamento em PDF"
              >
                <Download className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-500'}`} />
                Baixar em PDF
              </button>

              {/* Botão de compartilhar em PDF com ícone de compartilhamento */}
              <button
                type="button"
                onClick={handleSharePdf}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isLight
                    ? 'border-zinc-400 bg-white hover:bg-zinc-100 text-black shadow-xs'
                    : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
                title="Compartilhar Orçamento (WhatsApp ou Arquivo)"
              >
                <Share2 className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-emerald-500'}`} />
                Compartilhar em PDF
              </button>
            </div>

            {/* Right side: Cancelar e Salvar */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  isLight
                    ? 'border-zinc-400 text-black hover:bg-zinc-100'
                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all active:scale-98 ${
                  isLight
                    ? 'bg-cyan-700 hover:bg-cyan-800 shadow-cyan-700/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
              >
                <Save className="w-4 h-4" />
                Salvar Orçamento
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Camera Capture Sub-Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handleAddPhoto}
        theme={theme}
      />

      {/* Enlarged Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 animate-in fade-in">
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-zinc-300 p-1"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhoto.dataUrl}
              alt={previewPhoto.caption || 'Foto da avaria'}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain border border-zinc-800 shadow-2xl"
            />
            {previewPhoto.caption && (
              <p className="mt-2 text-white text-sm font-semibold">{previewPhoto.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
