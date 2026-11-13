import { NextRequest, NextResponse } from 'next/server';
import {
  getClientsByUser,
  upsertClient,
  deleteClient,
  getBudgetsByUser,
  upsertBudget,
  deleteBudget,
  getTransactionsByUser,
  upsertTransaction,
  deleteTransaction,
  getEventsByUser,
  upsertEvent,
  deleteEvent,
  getChecklistsByUser,
  upsertChecklist,
  deleteChecklist,
  getUserByEmail,
  getOrCreateUser,
  getCanonicalWorkspaceUserId,
  touchWorkspaceSync,
} from '@/src/db/queries';
import { notifySync } from '@/lib/syncNotifier';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get('userId') || searchParams.get('email') || '';
    const cleanUserId = getCanonicalWorkspaceUserId(rawUserId);

    if (!cleanUserId) {
      return NextResponse.json(
        { error: 'Identificador da conta (userId) é obrigatório.' },
        { status: 400 }
      );
    }

    // Buscar perfil do usuário para sincronizar dados cadastrais em múltiplos dispositivos
    const userRecord = await getUserByEmail(cleanUserId);
    const queryId = cleanUserId;

    const [clientsData, budgetsData, transactionsData, eventsData, checklistsData] =
      await Promise.all([
        getClientsByUser(queryId),
        getBudgetsByUser(queryId),
        getTransactionsByUser(queryId),
        getEventsByUser(queryId),
        getChecklistsByUser(queryId),
      ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userRecord
            ? {
                id: userRecord.id,
                uid: userRecord.uid,
                name: userRecord.name,
                email: userRecord.email,
                phone: userRecord.phone,
                workshopName: userRecord.workshopName,
                workshopAddress: userRecord.workshopAddress,
                password: userRecord.password,
              }
            : null,
          clients: clientsData,
          budgets: budgetsData,
          transactions: transactionsData,
          events: eventsData,
          checklists: checklistsData,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
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
    const {
      userId,
      clients,
      budgets,
      transactions,
      events,
      checklists,
      profile,
      deletedItem,
    } = body;

    const rawTarget = userId || (profile && profile.email) || '';
    const targetUserId = getCanonicalWorkspaceUserId(rawTarget);

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Identificador da conta (userId) é obrigatório para sincronizar.' },
        { status: 400 }
      );
    }

    // 0. Processamento de Exclusão no Banco de Dados
    if (deletedItem && deletedItem.id && deletedItem.type) {
      if (deletedItem.type === 'transaction') {
        await deleteTransaction(deletedItem.id, targetUserId);
      } else if (deletedItem.type === 'budget') {
        await deleteBudget(deletedItem.id, targetUserId);
      } else if (deletedItem.type === 'client') {
        await deleteClient(deletedItem.id, targetUserId);
      } else if (deletedItem.type === 'event') {
        await deleteEvent(deletedItem.id, targetUserId);
      } else if (deletedItem.type === 'checklist') {
        await deleteChecklist(deletedItem.id, targetUserId);
      }
    }

    // 1. Sync User Profile se fornecido explicitamente para a mesma conta
    if (profile && profile.email) {
      const cleanProfileEmail = profile.email.trim().toLowerCase();
      if (cleanProfileEmail === targetUserId) {
        await getOrCreateUser({
          uid: targetUserId,
          email: cleanProfileEmail,
          name: profile.name,
          phone: profile.phone,
          workshopName: profile.workshopName,
          workshopAddress: profile.workshopAddress,
          password: profile.password,
        });
      }
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

    // Persiste atualização no PostgreSQL para sincronização entre múltiplas instâncias
    await touchWorkspaceSync(targetUserId);

    // Notifica em tempo real todos os dispositivos que estão com a conta aberta
    notifySync(targetUserId);

    return NextResponse.json({
      success: true,
      version: Date.now(),
      message: 'Dados sincronizados com sucesso no banco de dados!',
    });
  } catch (error: any) {
    console.error('Error in POST /api/sync:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao sincronizar dados com o banco de dados.' },
      { status: 500 }
    );
  }
}
