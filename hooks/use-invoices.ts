'use client';

import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { storageUtils } from '@/lib/storage';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInvoices(storageUtils.getInvoices());
    setLoading(false);
  }, []);

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice = storageUtils.addInvoice(invoiceData);
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const updatedInvoice = storageUtils.updateInvoice(id, updates);
    if (updatedInvoice) {
      setInvoices(prev => prev.map(i => i.id === id ? updatedInvoice : i));
    }
    return updatedInvoice;
  };

  const deleteInvoice = (id: string) => {
    const success = storageUtils.deleteInvoice(id);
    if (success) {
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
    return success;
  };

  const getInvoice = (id: string) => {
    return invoices.find(i => i.id === id);
  };

  const getInvoicesByPatient = (patientId: string) => {
    return invoices.filter(i => i.patientId === patientId);
  };

  return {
    invoices,
    loading,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    getInvoicesByPatient,
  };
}