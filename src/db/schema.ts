import { pgTable, text, serial, timestamp, integer, doublePrecision, boolean, jsonb } from 'drizzle-orm/pg-core';

// Tabela de Usuários da JL Automotive
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID ou ID de sessão
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  workshopName: text('workshop_name'),
  workshopAddress: text('workshop_address'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Clientes
export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  notes: text('notes'),
  lastVehicle: text('last_vehicle'),
  totalBudgetsCount: integer('total_budgets_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Orçamentos
export const budgets = pgTable('budgets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  clientName: text('client_name').notNull(),
  phone: text('phone'),
  vehicleModel: text('vehicle_model'),
  plate: text('plate'),
  manufactureYear: text('manufacture_year'),
  vehicleColor: text('vehicle_color'),
  serviceDescription: text('service_description'),
  notes: text('notes'),
  amount: doublePrecision('amount').default(0),
  formattedAmount: text('formatted_amount'),
  deadlineDate: text('deadline_date'),
  status: text('status').notNull().default('Pendente'),
  photos: jsonb('photos').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Transações Financeiras (Entradas, Saídas e Balancete)
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'entrada' | 'saida'
  description: text('description').notNull(),
  category: text('category'),
  amount: doublePrecision('amount').default(0),
  formattedAmount: text('formatted_amount'),
  date: text('date').notNull(), // YYYY-MM-DD
  isPaid: boolean('is_paid').default(true),
  paymentMethod: text('payment_method'),
  budgetId: text('budget_id'),
  clientName: text('client_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Eventos, Notas e Lembretes da Agenda
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // YYYY-MM-DD
  type: text('type').notNull().default('evento'), // 'evento' | 'nota' | 'lembrete' | 'entrega'
  color: text('color'),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Check-lists de Vistoria dos Veículos
export const checklists = pgTable('checklists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  budgetId: text('budget_id'),
  vehicleModel: text('vehicle_model'),
  plate: text('plate'),
  title: text('title').notNull(),
  items: jsonb('items').default('[]'), // [{ id, label, checked }]
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
