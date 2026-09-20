'use client';

import { useState, useEffect } from 'react';
import { MedicalRecord } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function useMedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiList<MedicalRecord>('medical-records')
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const addRecord = async (data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const record = await apiCreate<MedicalRecord>('medical-records', data);
    setRecords(prev => [record, ...prev]);
    return record;
  };

  const updateRecord = async (id: string, updates: Partial<MedicalRecord>) => {
    const current = records.find(r => r.id === id);
    if (!current) return null;
    const updated = await apiUpdate<MedicalRecord>('medical-records', id, { ...current, ...updates });
    setRecords(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const deleteRecord = async (id: string) => {
    await apiDelete('medical-records', id);
    setRecords(prev => prev.filter(r => r.id !== id));
    return true;
  };

  const byPatient = (patientId: string) =>
    records
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { records, loading, addRecord, updateRecord, deleteRecord, byPatient };
}
