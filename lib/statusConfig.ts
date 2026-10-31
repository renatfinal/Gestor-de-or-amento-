import { BudgetStatus } from './types';

export interface StatusConfig {
  label: BudgetStatus;
  colorName: string;
  dotBg: string;
  dotBorder: string;
  dotRing: string;
  badgeBgLight: string;
  badgeBgDark: string;
  hex: string;
  description: string;
}

export const STATUS_OPTIONS: BudgetStatus[] = [
  'Pendente',
  'Aguardando Peças',
  'Aprovado',
  'Em Execução',
  'Concluído',
  'Entregue',
  'Cancelado',
];

export const STATUS_CONFIG: Record<BudgetStatus, StatusConfig> = {
  Pendente: {
    label: 'Pendente',
    colorName: 'Amarelo',
    dotBg: 'bg-amber-400',
    dotBorder: 'border-amber-500',
    dotRing: 'ring-amber-400/30',
    badgeBgLight: 'bg-amber-100 text-amber-950 border-amber-300',
    badgeBgDark: 'bg-amber-950/70 text-amber-300 border-amber-700/60',
    hex: '#FBBF24',
    description: 'Aguardando aprovação ou início',
  },
  'Aguardando Peças': {
    label: 'Aguardando Peças',
    colorName: 'Laranja',
    dotBg: 'bg-orange-500',
    dotBorder: 'border-orange-600',
    dotRing: 'ring-orange-500/30',
    badgeBgLight: 'bg-orange-100 text-orange-950 border-orange-300',
    badgeBgDark: 'bg-orange-950/70 text-orange-300 border-orange-700/60',
    hex: '#F97316',
    description: 'Peças ou tintas em trânsito',
  },
  Aprovado: {
    label: 'Aprovado',
    colorName: 'Azul Ciano',
    dotBg: 'bg-sky-500',
    dotBorder: 'border-sky-600',
    dotRing: 'ring-sky-500/30',
    badgeBgLight: 'bg-sky-100 text-sky-950 border-sky-300',
    badgeBgDark: 'bg-sky-950/70 text-sky-300 border-sky-700/60',
    hex: '#0EA5E9',
    description: 'Aprovado pelo cliente',
  },
  'Em Execução': {
    label: 'Em Execução',
    colorName: 'Roxo',
    dotBg: 'bg-purple-500',
    dotBorder: 'border-purple-600',
    dotRing: 'ring-purple-500/30',
    badgeBgLight: 'bg-purple-100 text-purple-950 border-purple-300',
    badgeBgDark: 'bg-purple-950/70 text-purple-300 border-purple-700/60',
    hex: '#A855F7',
    description: 'Funilaria / Pintura em andamento',
  },
  Concluído: {
    label: 'Concluído',
    colorName: 'Verde',
    dotBg: 'bg-emerald-500',
    dotBorder: 'border-emerald-600',
    dotRing: 'ring-emerald-500/30',
    badgeBgLight: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    badgeBgDark: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60',
    hex: '#10B981',
    description: 'Serviço finalizado / Carro pronto',
  },
  Entregue: {
    label: 'Entregue',
    colorName: 'Azul Escuro',
    dotBg: 'bg-indigo-600',
    dotBorder: 'border-indigo-700',
    dotRing: 'ring-indigo-600/30',
    badgeBgLight: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    badgeBgDark: 'bg-indigo-950/70 text-indigo-300 border-indigo-700/60',
    hex: '#4F46E5',
    description: 'Veículo entregue ao cliente',
  },
  Cancelado: {
    label: 'Cancelado',
    colorName: 'Vermelho',
    dotBg: 'bg-red-500',
    dotBorder: 'border-red-600',
    dotRing: 'ring-red-500/30',
    badgeBgLight: 'bg-red-100 text-red-950 border-red-300',
    badgeBgDark: 'bg-red-950/70 text-red-300 border-red-700/60',
    hex: '#EF4444',
    description: 'Orçamento cancelado',
  },
};

export function getStatusConfig(status: BudgetStatus | string | undefined): StatusConfig {
  if (status && status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as BudgetStatus];
  }
  return STATUS_CONFIG.Pendente;
}
