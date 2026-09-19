'use client';

import { useEffect, useState } from 'react';

/** Nombre y moneda de la organización del usuario logueado (para documentos y montos). */
export function useOrgSettings(): { orgName: string; currency: string } {
  const [orgName, setOrgName] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('medical_current_user') : null;
    const id = stored ? (JSON.parse(stored)?.id as string | undefined) : undefined;
    if (!id) return;
    fetch('/api/auth/me', { headers: { 'x-user-id': id } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setOrgName(d.organizationName ?? '');
          setCurrency(d.organizationCurrency ?? 'USD');
        }
      })
      .catch(() => {});
  }, []);

  return { orgName, currency };
}
