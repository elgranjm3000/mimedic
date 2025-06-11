'use client';

import { useState, useEffect } from 'react';
import { Appointment } from '@/lib/types';
import { storageUtils } from '@/lib/storage';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAppointments(storageUtils.getAppointments());
    setLoading(false);
  }, []);

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment = storageUtils.addAppointment(appointmentData);
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const updatedAppointment = storageUtils.updateAppointment(id, updates);
    if (updatedAppointment) {
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
    }
    return updatedAppointment;
  };

  const deleteAppointment = (id: string) => {
    const success = storageUtils.deleteAppointment(id);
    if (success) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
    return success;
  };

  const getAppointment = (id: string) => {
    return appointments.find(a => a.id === id);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(a => a.date === date);
  };

  const getAppointmentsByPatient = (patientId: string) => {
    return appointments.filter(a => a.patientId === patientId);
  };

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getAppointmentsByDate,
    getAppointmentsByPatient,
  };
}