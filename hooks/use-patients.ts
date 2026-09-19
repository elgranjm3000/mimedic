'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiList<Patient>('patients')
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPatient = await apiCreate<Patient>('patients', patientData);
    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    const current = patients.find(p => p.id === id);
    if (!current) return null;
    const updatedPatient = await apiUpdate<Patient>('patients', id, { ...current, ...updates });
    setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
    return updatedPatient;
  };

  const deletePatient = async (id: string) => {
    await apiDelete('patients', id);
    setPatients(prev => prev.filter(p => p.id !== id));
    return true;
  };

  const getPatient = (id: string) => {
    return patients.find(p => p.id === id);
  };

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
  };
}
