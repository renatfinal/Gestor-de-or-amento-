import { db } from './index.ts';
import { users, clients, budgets, transactions, events, checklists } from './schema.ts';
import { eq, and, desc, asc, sql, or } from 'drizzle-orm';

// --- USUÁRIOS ---
export async function getOrCreateUser(data: {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  workshopName?: string;
  workshopAddress?: string;
  password?: string;
}) {
  try {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('E-mail do usuário é obrigatório.');
    }
    const existing = await getUserByEmail(cleanEmail);

    if (existing) {
      const updated = await db
        .update(users)
        .set({
          email: cleanEmail,
          ...(data.name && data.name.trim() ? { name: data.name.trim() } : {}),
          ...(data.phone && data.phone.trim() ? { phone: data.phone.trim() } : {}),
          ...(data.workshopName && data.workshopName.trim()
            ? { workshopName: data.workshopName.trim() }
            : {}),
          ...(data.workshopAddress !== undefined
            ? { workshopAddress: data.workshopAddress.trim() }
            : {}),
          ...(data.password && data.password.trim()
            ? { password: data.password.trim() }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
      return updated[0];
    }

    const result = await db
      .insert(users)
      .values({
        uid: (data.uid || cleanEmail).trim().toLowerCase(),
        email: cleanEmail,
        name: (data.name || 'JL Automotive').trim(),
        phone: (data.phone || '').trim(),
        workshopName: (data.workshopName || 'JL Automotive - Funilaria & Pintura').trim(),
        workshopAddress: (data.workshopAddress || '').trim(),
        password: (data.password || '').trim(),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Falha ao registrar ou buscar usuário.', { cause: error });
  }
}

export async function getUserByEmail(email: string) {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return null;

    const result = await db
      .select()
      .from(users)
      .where(
        or(
          sql`LOWER(${users.email}) = LOWER(${cleanEmail})`,
          sql`LOWER(${users.uid}) = LOWER(${cleanEmail})`
        )
      )
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw new Error('Falha ao buscar usuário por email.', { cause: error });
  }
}

export async function updateUserPassword(emailOrUid: string, newPassword: string) {
  try {
    const clean = (emailOrUid || '').trim().toLowerCase();
    const result = await db
      .update(users)
      .set({ password: newPassword.trim(), updatedAt: new Date() })
      .where(
        or(
          sql`LOWER(${users.email}) = LOWER(${clean})`,
          sql`LOWER(${users.uid}) = LOWER(${clean})`
        )
      )
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Error in updateUserPassword:', error);
    throw new Error('Falha ao atualizar senha.', { cause: error });
  }
}

// --- IDENTIFICADOR DE CONTA DO USUÁRIO ---
export function getCanonicalWorkspaceUserId(userId: string): string {
  return (userId || '').trim().toLowerCase();
}

export async function touchWorkspaceSync(userId: string) {
  const canonicalId = getCanonicalWorkspaceUserId(userId);
  try {
    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(
        or(
          sql`LOWER(${users.email}) = LOWER(${canonicalId})`,
          sql`LOWER(${users.uid}) = LOWER(${canonicalId})`
        )
      );
  } catch (err) {
    console.warn('Error touching workspace sync:', err);
  }
}

export async function getWorkspaceSyncTimestamp(userId: string): Promise<number> {
  const canonicalId = getCanonicalWorkspaceUserId(userId);
  try {
    const user = await getUserByEmail(canonicalId);
    if (user?.updatedAt) {
      return new Date(user.updatedAt).getTime();
    }
  } catch (err) {
    console.warn('Error reading workspace sync timestamp:', err);
  }
  return Date.now();
}

// --- CLIENTES ---
export async function getClientsByUser(userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, targetUserId))
      .orderBy(asc(clients.name));
  } catch (error) {
    console.error('Error in getClientsByUser:', error);
    throw new Error('Falha ao listar clientes.', { cause: error });
  }
}

export async function upsertClient(clientData: {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  lastVehicle?: string;
  totalBudgetsCount?: number;
}) {
  const targetUserId = getCanonicalWorkspaceUserId(clientData.userId);
  if (!targetUserId) throw new Error('userId é obrigatório para salvar cliente.');
  try {
    const result = await db
      .insert(clients)
      .values({
        id: clientData.id,
        userId: targetUserId,
        name: clientData.name,
        phone: clientData.phone || '',
        email: clientData.email || '',
        address: clientData.address || '',
        notes: clientData.notes || '',
        lastVehicle: clientData.lastVehicle || '',
        totalBudgetsCount: clientData.totalBudgetsCount ?? 1,
      })
      .onConflictDoUpdate({
        target: clients.id,
        set: {
          name: clientData.name,
          phone: clientData.phone || '',
          email: clientData.email || '',
          address: clientData.address || '',
          notes: clientData.notes || '',
          lastVehicle: clientData.lastVehicle || '',
          totalBudgetsCount: clientData.totalBudgetsCount ?? 1,
          updatedAt: new Date(),
        },
        setWhere: eq(clients.userId, targetUserId),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in upsertClient:', error);
    throw new Error('Falha ao salvar cliente.', { cause: error });
  }
}

export async function deleteClient(id: string, userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, targetUserId)));
    return { success: true };
  } catch (error) {
    console.error('Error in deleteClient:', error);
    throw new Error('Falha ao excluir cliente.', { cause: error });
  }
}

// --- ORÇAMENTOS ---
export async function getBudgetsByUser(userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, targetUserId))
      .orderBy(desc(budgets.createdAt));
  } catch (error) {
    console.error('Error in getBudgetsByUser:', error);
    throw new Error('Falha ao listar orçamentos.', { cause: error });
  }
}

export async function upsertBudget(budgetData: {
  id: string;
  userId: string;
  clientName: string;
  phone?: string;
  vehicleModel?: string;
  plate?: string;
  manufactureYear?: string;
  vehicleColor?: string;
  serviceDescription?: string;
  notes?: string;
  amount?: number;
  formattedAmount?: string;
  deadlineDate?: string;
  status: string;
  photos?: any;
}) {
  const targetUserId = getCanonicalWorkspaceUserId(budgetData.userId);
  if (!targetUserId) throw new Error('userId é obrigatório para salvar orçamento.');
  try {
    const result = await db
      .insert(budgets)
      .values({
        id: budgetData.id,
        userId: targetUserId,
        clientName: budgetData.clientName,
        phone: budgetData.phone || '',
        vehicleModel: budgetData.vehicleModel || '',
        plate: budgetData.plate || '',
        manufactureYear: budgetData.manufactureYear || '',
        vehicleColor: budgetData.vehicleColor || '',
        serviceDescription: budgetData.serviceDescription || '',
        notes: budgetData.notes || '',
        amount: budgetData.amount ?? 0,
        formattedAmount: budgetData.formattedAmount || '0,00',
        deadlineDate: budgetData.deadlineDate || '',
        status: budgetData.status || 'Pendente',
        photos: budgetData.photos || [],
      })
      .onConflictDoUpdate({
        target: budgets.id,
        set: {
          clientName: budgetData.clientName,
          phone: budgetData.phone || '',
          vehicleModel: budgetData.vehicleModel || '',
          plate: budgetData.plate || '',
          manufactureYear: budgetData.manufactureYear || '',
          vehicleColor: budgetData.vehicleColor || '',
          serviceDescription: budgetData.serviceDescription || '',
          notes: budgetData.notes || '',
          amount: budgetData.amount ?? 0,
          formattedAmount: budgetData.formattedAmount || '0,00',
          deadlineDate: budgetData.deadlineDate || '',
          status: budgetData.status || 'Pendente',
          photos: budgetData.photos || [],
          updatedAt: new Date(),
        },
        setWhere: eq(budgets.userId, targetUserId),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in upsertBudget:', error);
    throw new Error('Falha ao salvar orçamento.', { cause: error });
  }
}

export async function deleteBudget(id: string, userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, targetUserId)));
    return { success: true };
  } catch (error) {
    console.error('Error in deleteBudget:', error);
    throw new Error('Falha ao remover orçamento.', { cause: error });
  }
}

// --- TRANSAÇÕES (FINANCEIRO & BALANCETE) ---
export async function getTransactionsByUser(userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, targetUserId))
      .orderBy(desc(transactions.date));
  } catch (error) {
    console.error('Error in getTransactionsByUser:', error);
    throw new Error('Falha ao listar transações financeiras.', { cause: error });
  }
}

export async function upsertTransaction(txData: {
  id: string;
  userId: string;
  type: string;
  description: string;
  category?: string;
  amount?: number;
  formattedAmount?: string;
  date: string;
  isPaid?: boolean;
  paymentMethod?: string;
  budgetId?: string;
  clientName?: string;
}) {
  const targetUserId = getCanonicalWorkspaceUserId(txData.userId);
  if (!targetUserId) throw new Error('userId é obrigatório para salvar transação.');
  try {
    const result = await db
      .insert(transactions)
      .values({
        id: txData.id,
        userId: targetUserId,
        type: txData.type,
        description: txData.description,
        category: txData.category || '',
        amount: txData.amount ?? 0,
        formattedAmount: txData.formattedAmount || '0,00',
        date: txData.date,
        isPaid: txData.isPaid ?? true,
        paymentMethod: txData.paymentMethod || '',
        budgetId: txData.budgetId || '',
        clientName: txData.clientName || '',
      })
      .onConflictDoUpdate({
        target: transactions.id,
        set: {
          type: txData.type,
          description: txData.description,
          category: txData.category || '',
          amount: txData.amount ?? 0,
          formattedAmount: txData.formattedAmount || '0,00',
          date: txData.date,
          isPaid: txData.isPaid ?? true,
          paymentMethod: txData.paymentMethod || '',
          budgetId: txData.budgetId || '',
          clientName: txData.clientName || '',
        },
        setWhere: eq(transactions.userId, targetUserId),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in upsertTransaction:', error);
    throw new Error('Falha ao salvar transação.', { cause: error });
  }
}

export async function deleteTransaction(id: string, userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, targetUserId)));
    return { success: true };
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    throw new Error('Falha ao excluir transação.', { cause: error });
  }
}

// --- EVENTOS & NOTAS ---
export async function getEventsByUser(userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, targetUserId))
      .orderBy(asc(events.date));
  } catch (error) {
    console.error('Error in getEventsByUser:', error);
    throw new Error('Falha ao listar eventos da agenda.', { cause: error });
  }
}

export async function upsertEvent(eventData: {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  type?: string;
  color?: string;
  completed?: boolean;
}) {
  const targetUserId = getCanonicalWorkspaceUserId(eventData.userId);
  if (!targetUserId) throw new Error('userId é obrigatório para salvar evento.');
  try {
    const result = await db
      .insert(events)
      .values({
        id: eventData.id,
        userId: targetUserId,
        title: eventData.title,
        description: eventData.description || '',
        date: eventData.date,
        type: eventData.type || 'evento',
        color: eventData.color || '#10b981',
        completed: eventData.completed ?? false,
      })
      .onConflictDoUpdate({
        target: events.id,
        set: {
          title: eventData.title,
          description: eventData.description || '',
          date: eventData.date,
          type: eventData.type || 'evento',
          color: eventData.color || '#10b981',
          completed: eventData.completed ?? false,
        },
        setWhere: eq(events.userId, targetUserId),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in upsertEvent:', error);
    throw new Error('Falha ao salvar evento.', { cause: error });
  }
}

export async function deleteEvent(id: string, userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    await db.delete(events).where(and(eq(events.id, id), eq(events.userId, targetUserId)));
    return { success: true };
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw new Error('Falha ao remover evento.', { cause: error });
  }
}

// --- CHECK-LISTS ---
export async function getChecklistsByUser(userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    return await db
      .select()
      .from(checklists)
      .where(eq(checklists.userId, targetUserId))
      .orderBy(desc(checklists.createdAt));
  } catch (error) {
    console.error('Error in getChecklistsByUser:', error);
    throw new Error('Falha ao listar check-lists.', { cause: error });
  }
}

export async function upsertChecklist(data: {
  id: string;
  userId: string;
  budgetId?: string;
  vehicleModel?: string;
  plate?: string;
  title: string;
  items?: any;
  notes?: string;
}) {
  const targetUserId = getCanonicalWorkspaceUserId(data.userId);
  if (!targetUserId) throw new Error('userId é obrigatório para salvar check-list.');
  try {
    const result = await db
      .insert(checklists)
      .values({
        id: data.id,
        userId: targetUserId,
        budgetId: data.budgetId || '',
        vehicleModel: data.vehicleModel || '',
        plate: data.plate || '',
        title: data.title,
        items: data.items || [],
        notes: data.notes || '',
      })
      .onConflictDoUpdate({
        target: checklists.id,
        set: {
          budgetId: data.budgetId || '',
          vehicleModel: data.vehicleModel || '',
          plate: data.plate || '',
          title: data.title,
          items: data.items || [],
          notes: data.notes || '',
          updatedAt: new Date(),
        },
        setWhere: eq(checklists.userId, targetUserId),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in upsertChecklist:', error);
    throw new Error('Falha ao salvar check-list.', { cause: error });
  }
}

export async function deleteChecklist(id: string, userId: string) {
  const targetUserId = getCanonicalWorkspaceUserId(userId);
  try {
    await db.delete(checklists).where(and(eq(checklists.id, id), eq(checklists.userId, targetUserId)));
    return { success: true };
  } catch (error) {
    console.error('Error in deleteChecklist:', error);
    throw new Error('Falha ao remover check-list.', { cause: error });
  }
}
