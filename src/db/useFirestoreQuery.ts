import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type Query,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Collection query — returns T[] | undefined (undefined = loading)
// ---------------------------------------------------------------------------

export function useCollectionQuery<T>(
  q: Query<DocumentData> | null,
  deps: unknown[] = [],
): T[] | undefined {
  const [data, setData] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    if (!q) {
      setData([]);
      return;
    }

    const unsub = onSnapshot(q, (snapshot) => {
      setData(
        snapshot.docs.map(
          (d) => ({ ...d.data(), id: d.data().id ?? Number(d.id) }) as unknown as T,
        ),
      );
    });

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}

// ---------------------------------------------------------------------------
// Single document query — returns T | null | undefined
//   undefined = loading, null = not found
// ---------------------------------------------------------------------------

export function useDocQuery<T>(
  ref: DocumentReference<DocumentData> | null,
  deps: unknown[] = [],
): T | null | undefined {
  const [data, setData] = useState<T | null | undefined>(undefined);

  useEffect(() => {
    if (!ref) {
      setData(null);
      return;
    }

    const unsub = onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) {
        setData(null);
        return;
      }
      setData({
        ...snapshot.data(),
        id: snapshot.data()!.id ?? Number(snapshot.id),
      } as unknown as T);
    });

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}
