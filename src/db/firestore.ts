import { firestore } from '../lib/firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, writeBatch, runTransaction,
  type Query, type DocumentData, type WhereFilterOp, type OrderByDirection
} from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Auto-increment ID helper
// ---------------------------------------------------------------------------

/** Get next auto-increment ID from meta/counters doc */
export async function getNextId(collectionName: string): Promise<number> {
  const countersRef = doc(firestore, 'meta', 'counters');

  return runTransaction(firestore, async (tx) => {
    const snap = await tx.get(countersRef);
    const data = snap.exists() ? snap.data() : {};
    const current: number = (data[collectionName] as number) ?? 0;
    const next = current + 1;
    tx.set(countersRef, { ...data, [collectionName]: next }, { merge: true });
    return next;
  });
}

// ---------------------------------------------------------------------------
// Generic CRUD
// ---------------------------------------------------------------------------

export async function getAll<T>(collectionName: string): Promise<T[]> {
  const snap = await getDocs(collection(firestore, collectionName));
  return snap.docs.map(d => ({ ...d.data(), id: d.data().id ?? Number(d.id) } as T));
}

export async function getById<T>(collectionName: string, id: number): Promise<T | undefined> {
  const snap = await getDoc(doc(firestore, collectionName, String(id)));
  if (!snap.exists()) return undefined;
  return { ...snap.data(), id: snap.data().id ?? Number(snap.id) } as T;
}

export async function queryByField<T>(
  collectionName: string,
  field: string,
  value: unknown,
): Promise<T[]> {
  const q = query(collection(firestore, collectionName), where(field, '==', value));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.data().id ?? Number(d.id) } as T));
}

export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id'>,
): Promise<number> {
  const id = await getNextId(collectionName);
  await setDoc(doc(firestore, collectionName, String(id)), { ...data, id });
  return id;
}

export async function updateDocument(
  collectionName: string,
  id: number,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(firestore, collectionName, String(id)), data);
}

export async function deleteDocument(collectionName: string, id: number): Promise<void> {
  await deleteDoc(doc(firestore, collectionName, String(id)));
}

// ---------------------------------------------------------------------------
// Re-exports for advanced / ad-hoc usage
// ---------------------------------------------------------------------------

export {
  firestore, collection, doc, query, where, orderBy, limit,
  getDocs, getDoc, writeBatch, runTransaction, setDoc,
  updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc,
};
export type { Query, DocumentData, WhereFilterOp, OrderByDirection };
