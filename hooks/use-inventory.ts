'use client';

import { useState, useEffect } from 'react';
import { InventoryItem, StockMovement } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiList<InventoryItem>('inventory'),
      apiList<StockMovement>('stock-movements'),
    ])
      .then(([i, m]) => {
        setItems(i.sort((a, b) => a.name.localeCompare(b.name)));
        setMovements(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addItem = async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item = await apiCreate<InventoryItem>('inventory', data);
    setItems(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
    return item;
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const current = items.find(i => i.id === id);
    if (!current) return null;
    const updated = await apiUpdate<InventoryItem>('inventory', id, { ...current, ...updates });
    setItems(prev => prev.map(i => i.id === id ? updated : i).sort((a, b) => a.name.localeCompare(b.name)));
    return updated;
  };

  const deleteItem = async (id: string) => {
    await apiDelete('inventory', id);
    setItems(prev => prev.filter(i => i.id !== id));
    return true;
  };

  const addMovement = async (
    data: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>,
    newStock: number,
    itemId: string
  ) => {
    const movement = await apiCreate<StockMovement>('stock-movements', data);
    await updateItem(itemId, { stock: newStock });
    setMovements(prev => [movement, ...prev]);
    return movement;
  };

  return {
    items,
    movements,
    loading,
    addItem,
    updateItem,
    deleteItem,
    addMovement,
  };
}
