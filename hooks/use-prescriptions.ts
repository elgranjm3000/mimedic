'use client';

import { useState, useEffect } from 'react';
import { Prescription } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiList<Prescription>('prescriptions')
      .then(setPrescriptions)
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false));
  }, []);

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrescription = await apiCreate<Prescription & { _warnings?: unknown }>('prescriptions', prescriptionData);
    const { _warnings, ...clean } = newPrescription;
    setPrescriptions(prev => [clean as Prescription, ...prev]);
    return newPrescription as Prescription & { _warnings?: unknown };
  };

  const updatePrescription = async (id: string, updates: Partial<Prescription>) => {
    const current = prescriptions.find(p => p.id === id);
    if (!current) return null;
    const updatedPrescription = await apiUpdate<Prescription>('prescriptions', id, { ...current, ...updates });
    setPrescriptions(prev => prev.map(p => p.id === id ? updatedPrescription : p));
    return updatedPrescription;
  };

  const deletePrescription = async (id: string) => {
    await apiDelete('prescriptions', id);
    setPrescriptions(prev => prev.filter(p => p.id !== id));
    return true;
  };

  const getPrescription = (id: string) => {
    return prescriptions.find(p => p.id === id);
  };

  const getPrescriptionsByPatient = (patientId: string) => {
    return prescriptions.filter(p => p.patientId === patientId);
  };

  return {
    prescriptions,
    loading,
    addPrescription,
    updatePrescription,
    deletePrescription,
    getPrescription,
    getPrescriptionsByPatient,
  };
}
