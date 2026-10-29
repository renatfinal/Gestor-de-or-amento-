'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title = 'Confirmar Exclusão',
  message = 'Deseja excluir?',
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-900 dark:text-zinc-100">
        {/* Close Button X */}
        <button
          onClick={onCancel}
          type="button"
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-full transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
          </div>
        </div>

        {/* Buttons: Não na cor vermelha, Sim na cor verde */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
          >
            Não
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
}
