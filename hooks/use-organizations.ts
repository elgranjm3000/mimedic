'use client';

import { useState, useEffect } from 'react';
import { Organization } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiList<Organization>('organizations')
      .then(setOrganizations)
      .catch(() => setOrganizations([]))
      .finally(() => setLoading(false));
  }, []);

  const addOrganization = async (data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrganization = await apiCreate<Organization>('organizations', data);
    setOrganizations(prev => [newOrganization, ...prev]);
    return newOrganization;
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    const current = organizations.find(o => o.id === id);
    if (!current) return null;
    const updated = await apiUpdate<Organization>('organizations', id, { ...current, ...updates });
    setOrganizations(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  };

  const deleteOrganization = async (id: string) => {
    await apiDelete('organizations', id);
    setOrganizations(prev => prev.filter(o => o.id !== id));
    return true;
  };

  return {
    organizations,
    loading,
    addOrganization,
    updateOrganization,
    deleteOrganization,
  };
}
