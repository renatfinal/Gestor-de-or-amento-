export type ThemeMode = 'light-cyan' | 'dark-spring';

export type BudgetStatus =
  | 'Pendente'
  | 'Aprovado'
  | 'Em Execução'
  | 'Aguardando Peças'
  | 'Concluído'
  | 'Entregue'
  | 'Cancelado';

export interface VehiclePhoto {
  id: string;
  dataUrl: string;
  caption?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  clientName: string;
  phone: string;
  vehicleModel: string;
  plate: string;
  manufactureYear: string;
  vehicleColor?: string;
  serviceDescription: string;
  notes: string;
  amount: number; // raw numeric value
  formattedAmount: string; // '1.500,00'
  deadlineDate: string; // 'XX/XX/XXXX'
  status: BudgetStatus;
  photos: VehiclePhoto[];
  createdAt: string; // ISO string
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalBudgetsCount: number;
  lastVehicle?: string;
  createdAt: string;
}

export type TransactionType = 'entrada' | 'saida';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  formattedAmount: string; // '0.000,00'
  date: string; // YYYY-MM-DD
  isPaid: boolean; // Relevant for Saídas ("listar como pago") and Entradas
  paymentMethod?: string;
  budgetId?: string;
  clientName?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  phone: string; // (XX) XXXXX-XXXX
  email: string;
  password?: string;
  workshopName: string;
  workshopAddress?: string;
}

export type ActiveTab = 'calendar' | 'new-budget' | 'clients' | 'financial' | 'balance';
