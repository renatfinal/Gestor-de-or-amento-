import { NextRequest, NextResponse } from 'next/server';
import {
  getClientsByUser,
  upsertClient,
  getBudgetsByUser,
  upsertBudget,
  getTransactionsByUser,
  upsertTransaction,
  getEventsByUser,
  upsertEvent,
  getChecklistsByUser,
  upsertChecklist,
  getUserByEmail,
  getOrCreateUser,
} from '@/src/db/queries';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || searchParams.get('email') || 'default_user';

    const [clientsData, budgetsData, transactionsData, eventsData, checklistsData] =
      await Promise.all([
        getClientsByUser(userId),
        getBudgetsByUser(userId),
        getTransactionsByUser(userId),
        getEventsByUser(userId),
        getChecklistsByUser(userId),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        clients: clientsData,
        budgets: budgetsData,
        transactions: transactionsData,
        events: eventsData,
        checklists: checklistsData,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/sync:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao sincronizar dados com o banco de dados.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, clients, budgets, transactions, events, checklists, profile } = body;

    const targetUserId = userId || (profile && profile.email) || 'default_user';

    // 1. Sync User Profile se fornecido
    if (profile && profile.email) {
      await getOrCreateUser({
        uid: targetUserId,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        workshopName: profile.workshopName,
        workshopAddress: profile.workshopAddress,
        password: profile.password,
      });
    }

    // 2. Sync Clientes
    if (Array.isArray(clients)) {
      for (const client of clients) {
        if (client.id && client.name) {
          await upsertClient({
            id: client.id,
            userId: targetUserId,
            name: client.name,
            phone: client.phone,
            email: client.email,
            address: client.address,
            notes: client.notes,
            lastVehicle: client.lastVehicle,
            totalBudgetsCount: client.totalBudgetsCount,
          });
        }
      }
    }

    // 3. Sync Orçamentos
    if (Array.isArray(budgets)) {
      for (const budget of budgets) {
        if (budget.id && budget.clientName) {
          await upsertBudget({
            id: budget.id,
            userId: targetUserId,
            clientName: budget.clientName,
            phone: budget.phone,
            vehicleModel: budget.vehicleModel,
            plate: budget.plate,
            manufactureYear: budget.manufactureYear,
            vehicleColor: budget.vehicleColor,
            serviceDescription: budget.serviceDescription,
            notes: budget.notes,
            amount: budget.amount,
            formattedAmount: budget.formattedAmount,
            deadlineDate: budget.deadlineDate,
            status: budget.status || 'Pendente',
            photos: budget.photos || [],
          });
        }
      }
    }

    // 4. Sync Transações (Entradas, Saídas e Balancete)
    if (Array.isArray(transactions)) {
      for (const tx of transactions) {
        if (tx.id && tx.description) {
          await upsertTransaction({
            id: tx.id,
            userId: targetUserId,
            type: tx.type,
            description: tx.description,
            category: tx.category,
            amount: tx.amount,
            formattedAmount: tx.formattedAmount,
            date: tx.date,
            isPaid: tx.isPaid,
            paymentMethod: tx.paymentMethod,
            budgetId: tx.budgetId,
            clientName: tx.clientName,
          });
        }
      }
    }

    // 5. Sync Eventos & Notas
    if (Array.isArray(events)) {
      for (const ev of events) {
        if (ev.id && ev.title) {
          await upsertEvent({
            id: ev.id,
            userId: targetUserId,
            title: ev.title,
            description: ev.description,
            date: ev.date,
            type: ev.type,
            color: ev.color,
            completed: ev.completed,
          });
        }
      }
    }

    // 6. Sync Checklists
    if (Array.isArray(checklists)) {
      for (const chk of checklists) {
        if (chk.id && chk.title) {
          await upsertChecklist({
            id: chk.id,
            userId: targetUserId,
            budgetId: chk.budgetId,
            vehicleModel: chk.vehicleModel,
            plate: chk.plate,
            title: chk.title,
            items: chk.items,
            notes: chk.notes,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Dados sincronizados com sucesso no banco de dados!' });
  } catch (error: any) {
    console.error('Error in POST /api/sync:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao sincronizar dados com o banco de dados.' },
      { status: 500 }
    );
  }
}
