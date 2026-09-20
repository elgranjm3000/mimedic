'use client';

import { useState, useEffect } from 'react';
import { CashEntry } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function useCashEntries() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiList<CashEntry>('cash-entries')
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const addEntry = async (data: Omit<CashEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const entry = await apiCreate<CashEntry>('cash-entries', data);
    setEntries(prev => [entry, ...prev]);
    return entry;
  };

  const deleteEntry = async (id: string) => {
    await apiDelete('cash-entries', id);
    setEntries(prev => prev.filter(e => e.id !== id));
    return true;
  };

  return { entries, loading, addEntry, deleteEntry };
}
