'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Save,
  Trash2,
  CheckSquare,
  Square,
  Plus,
  Clock,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { CalendarEvent, ThemeMode } from '@/lib/types';

interface EventModalProps {
  isOpen: boolean;
  presetDate?: string; // YYYY-MM-DD
  events: CalendarEvent[];
  onClose: () => void;
  onSaveEvent: (event: CalendarEvent) => Promise<{ success: boolean; error?: string }>;
  onDeleteEvent: (id: string) => Promise<{ success: boolean; error?: string }>;
  theme: ThemeMode;
}

const TYPE_OPTIONS: {
  value: CalendarEvent['type'];
  label: string;
  color: string;
}[] = [
  { value: 'evento', label: 'Evento da Agenda', color: '#10b981' },
  { value: 'entrega', label: 'Entrega de Veículo', color: '#10b981' },
  { value: 'lembrete', label: 'Lembrete / Peças', color: '#06b6d4' },
  { value: 'nota', label: 'Nota da Oficina', color: '#f59e0b' },
];

export function EventModal({
  isOpen,
  presetDate,
  events,
  onClose,
  onSaveEvent,
  onDeleteEvent,
  theme,
}: EventModalProps) {
  const isLight = theme !== 'dark-spring';
  const defaultDate = presetDate || new Date().toISOString().split('T')[0];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [type, setType] = useState<CalendarEvent['type']>('evento');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const dayEvents = events.filter((ev) => ev.date === date);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setType('evento');
    setError(null);
  };

  const handleEditSelect = (ev: CalendarEvent) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description || '');
    setDate(ev.date);
    setType(ev.type || 'evento');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Por favor, informe o título do evento ou nota.');
      return;
    }

    const typeMeta = TYPE_OPTIONS.find((opt) => opt.value === type) || TYPE_OPTIONS[0];
    const existing = editingId ? events.find((ev) => ev.id === editingId) : undefined;

    const eventObj: CalendarEvent = {
      id:
        editingId ||
        `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      date: date || defaultDate,
      type,
      color: typeMeta.color,
      completed: existing ? Boolean(existing.completed) : false,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      const res = await onSaveEvent(eventObj);
      if (!res.success) {
        setError(res.error || 'Erro ao salvar evento no banco de dados.');
      } else {
        resetForm();
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCompleted = async (ev: CalendarEvent) => {
    setError(null);
    const res = await onSaveEvent({ ...ev, completed: !ev.completed });
    if (!res.success) {
      setError(res.error || 'Não foi possível atualizar o status no banco.');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const res = await onDeleteEvent(id);
    if (!res.success) {
      setError(res.error || 'Não foi possível excluir o evento do banco.');
    } else if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col max-h-[92dvh] sm:max-h-[88vh] my-auto transition-all ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900 shadow-emerald-950/15'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pinned Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 pr-8">
            <div
              className={`p-2.5 sm:p-3 rounded-2xl shrink-0 ${
                isLight
                  ? 'bg-emerald-100 text-emerald-950 font-black'
                  : 'bg-emerald-950/80 text-emerald-400'
              }`}
            >
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Eventos, Notas & Lembretes
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Salvos diretamente na nuvem e sincronizados em todos os seus dispositivos
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          {/* Form to create / edit event */}
          <form
            onSubmit={handleSubmit}
            className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-800/60 border-zinc-700/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {editingId ? 'Editar Evento / Nota' : 'Novo Evento / Nota'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold mb-1 text-zinc-700 dark:text-zinc-300">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Entrega Civic / Chegada de peças"
                  className={`w-full px-3 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs border focus:outline-hidden ${
                    isLight
                      ? 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                      : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-zinc-700 dark:text-zinc-300">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs border focus:outline-hidden ${
                    isLight
                      ? 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                      : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-zinc-700 dark:text-zinc-300">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
                  className={`w-full px-3 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs border focus:outline-hidden ${
                    isLight
                      ? 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                      : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                  }`}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold mb-1 text-zinc-700 dark:text-zinc-300">
                  Observação / Detalhes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes opcionais sobre horário, peça ou cliente..."
                  className={`w-full px-3 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs border focus:outline-hidden ${
                    isLight
                      ? 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                      : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-60 ${
                  isLight
                    ? 'bg-[#00FF7F] hover:bg-[#00e676] text-black'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-black'
                }`}
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : editingId ? (
                  <Save className="w-3.5 h-3.5 text-black" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-black" />
                )}
                <span>
                  {isSaving
                    ? 'Salvando na nuvem...'
                    : editingId
                    ? 'Atualizar Evento'
                    : 'Salvar Evento na Nuvem'}
                </span>
              </button>
            </div>
          </form>

          {/* Existing Events for Selected Date */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Registros para {date.split('-').reverse().join('/')} ({dayEvents.length})
              </h3>
            </div>

            {dayEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border border-dashed rounded-2xl border-zinc-300 dark:border-zinc-700">
                Nenhum evento ou nota cadastrada para esta data. Use o formulário acima para criar.
              </div>
            ) : (
              <div className="space-y-2">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      ev.completed
                        ? 'opacity-65 bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                        : isLight
                        ? 'bg-white border-zinc-200 shadow-xs'
                        : 'bg-zinc-800/80 border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(ev)}
                        className="mt-0.5 cursor-pointer shrink-0"
                        title={ev.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                      >
                        {ev.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400 hover:text-emerald-500" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                          <span>{ev.type}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3" />
                            {ev.date.split('-').reverse().join('/')}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-bold truncate ${
                            ev.completed
                              ? 'line-through text-zinc-400'
                              : 'text-zinc-900 dark:text-white'
                          }`}
                        >
                          {ev.title}
                        </p>
                        {ev.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 break-words">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditSelect(ev)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isLight
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-white text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
