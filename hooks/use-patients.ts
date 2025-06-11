'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { storageUtils } from '@/lib/storage';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPatients(storageUtils.getPatients());
    setLoading(false);
  }, []);

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPatient = storageUtils.addPatient(patientData);
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const updatedPatient = storageUtils.updatePatient(id, updates);
    if (updatedPatient) {
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
    }
    return updatedPatient;
  };

  const deletePatient = (id: string) => {
    const success = storageUtils.deletePatient(id);
    if (success) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
    return success;
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