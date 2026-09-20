'use client';

import { useEffect, useState } from 'react';

/** Nombre y moneda de la organización del usuario logueado (para documentos y montos). */
export function useOrgSettings(): { orgName: string; currency: string; orgLogo: string | null } {
  const [orgName, setOrgName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [orgLogo, setOrgLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setOrgName(d.organizationName ?? '');
          setCurrency(d.organizationCurrency ?? 'USD');
          setOrgLogo(d.organizationLogo ?? null);
        }
      })
      .catch(() => {});
  }, []);

  return { orgName, currency, orgLogo };
}
