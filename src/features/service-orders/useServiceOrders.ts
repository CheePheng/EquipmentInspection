import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { ServiceOrder } from '../../db/schemas/service-order.schema';
import { now, today } from '../../lib/utils';

export function useServiceOrders(status?: string) {
  return useLiveQuery(async () => {
    let query = db.serviceOrders.orderBy('createdAt');
    const all = await query.reverse().toArray();
    if (status) return all.filter(o => o.status === status);
    return all;
  }, [status]);
}

export function useServiceOrder(id: number) {
  return useLiveQuery(() => db.serviceOrders.get(id), [id]);
}

export function useActiveServiceOrder(machineId: number) {
  return useLiveQuery(async () => {
    const orders = await db.serviceOrders.where('machineId').equals(machineId).toArray();
    return orders.find(o => o.status === 'pending' || o.status === 'in-service' || o.status === 'returned');
  }, [machineId]);
}

export async function createServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt' | 'completedAt'>) {
  return db.serviceOrders.add({
    ...data,
    createdAt: now(),
    completedAt: null,
  });
}

export async function updateServiceOrderStatus(id: number, status: ServiceOrder['status'], extra?: Partial<ServiceOrder>) {
  const updates: Partial<ServiceOrder> = { status, ...extra };
  if (status === 'completed') updates.completedAt = now();
  if (status === 'returned' && !extra?.dateReturned) updates.dateReturned = today();
  await db.serviceOrders.update(id, updates);
}
