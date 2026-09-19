'use client';

import { useState, useEffect } from 'react';
import { Appointment } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiList<Appointment>('appointments')
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment = await apiCreate<Appointment>('appointments', appointmentData);
    setAppointments(prev => [newAppointment, ...prev]);
    return newAppointment;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const current = appointments.find(a => a.id === id);
    if (!current) return null;
    const updatedAppointment = await apiUpdate<Appointment>('appointments', id, { ...current, ...updates });
    setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
    return updatedAppointment;
  };

  const deleteAppointment = async (id: string) => {
    await apiDelete('appointments', id);
    setAppointments(prev => prev.filter(a => a.id !== id));
    return true;
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
