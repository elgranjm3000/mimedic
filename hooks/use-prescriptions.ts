'use client';

import { useState, useEffect } from 'react';
import { Prescription } from '@/lib/types';
import { storageUtils } from '@/lib/storage';

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPrescriptions(storageUtils.getPrescriptions());
    setLoading(false);
  }, []);

  const addPrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrescription = storageUtils.addPrescription(prescriptionData);
    setPrescriptions(prev => [...prev, newPrescription]);
    return newPrescription;
  };

  const updatePrescription = (id: string, updates: Partial<Prescription>) => {
    const updatedPrescription = storageUtils.updatePrescription(id, updates);
    if (updatedPrescription) {
      setPrescriptions(prev => prev.map(p => p.id === id ? updatedPrescription : p));
    }
    return updatedPrescription;
  };

  const deletePrescription = (id: string) => {
    const success = storageUtils.deletePrescription(id);
    if (success) {
      setPrescriptions(prev => prev.filter(p => p.id !== id));
    }
    return success;
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