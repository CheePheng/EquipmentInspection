import { useMemo } from 'react';
import { useCollectionQuery } from '../../db/useFirestoreQuery';
import { useDocQuery } from '../../db/useFirestoreQuery';
import { serviceOrdersRef, serviceOrderDoc, query, where } from '../../db/collections';
import { addDocument, updateDocument } from '../../db/firestore';
import type { ServiceOrder } from '../../db/schemas/service-order.schema';
import { now, today } from '../../lib/utils';

export function useServiceOrders(status?: string) {
  const q = useMemo(() => query(serviceOrdersRef()), []);
  const results = useCollectionQuery<any>(q, []);
  return useMemo(() => {
    if (results === undefined) return undefined;
    let filtered = results;
    if (status) filtered = results.filter((o: any) => o.status === status);
    return filtered.slice().sort((a: any, b: any) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }, [results, status]);
}

export function useServiceOrder(id: number) {
  return useDocQuery<any>(serviceOrderDoc(id), [id]);
}

export function useActiveServiceOrder(machineId: number) {
  const q = useMemo(
    () => query(serviceOrdersRef(), where('machineId', '==', machineId)),
    [machineId],
  );
  const results = useCollectionQuery<any>(q, [machineId]);
  return useMemo(
    () =>
      results === undefined
        ? undefined
        : results.find((o: any) => o.status === 'pending' || o.status === 'in-service' || o.status === 'returned'),
    [results],
  );
}

export async function createServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt' | 'completedAt'>) {
  return addDocument<any>('serviceOrders', {
    ...data,
    createdAt: now(),
    completedAt: null,
  });
}

export async function updateServiceOrderStatus(id: number, status: ServiceOrder['status'], extra?: Partial<ServiceOrder>) {
  const updates: Partial<ServiceOrder> = { status, ...extra };
  if (status === 'completed') updates.completedAt = now();
  if (status === 'returned' && !extra?.dateReturned) updates.dateReturned = today();
  await updateDocument('serviceOrders', id, updates as Record<string, unknown>);
}
