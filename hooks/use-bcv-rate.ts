'use client';

import { useEffect, useState } from 'react';

const CURRENT_USER_KEY = 'medical_current_user';

/** Tasa BCV USD→VES para el doble mostrado en facturas de organizaciones venezolanas. */
export function useBcvRate(enabled: boolean): { rate: number | null; updatedAt: string | null } {
  const [rate, setRate] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    const id = stored ? (JSON.parse(stored)?.id as string | undefined) : undefined;
    if (!id) return;
    fetch('/api/exchange-rate', { headers: { 'x-user-id': id } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.rate) {
          setRate(d.rate);
          setUpdatedAt(d.updatedAt);
        }
      })
      .catch(() => {});
  }, [enabled]);

  return { rate, updatedAt };
}

/** Convierte un monto entre USD y VES usando la tasa BCV. */
export function convert(amount: number, from: 'USD' | 'VES', rate: number | null): number | null {
  if (!rate || rate <= 0) return null;
  return from === 'USD' ? amount * rate : amount / rate;
}
