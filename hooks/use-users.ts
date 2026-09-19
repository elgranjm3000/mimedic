'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { apiCreate, apiDelete, apiList, apiUpdate } from '@/lib/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiList<User>('users')
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser = await apiCreate<User>('users', userData);
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const current = users.find(u => u.id === id);
    if (!current) return null;
    const { password: _password, ...merged } = { ...current, ...updates };
    const updatedUser = await apiUpdate<User>('users', id, merged);
    setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    return updatedUser;
  };

  const deleteUser = async (id: string) => {
    await apiDelete('users', id);
    setUsers(prev => prev.filter(u => u.id !== id));
    return true;
  };

  const getUser = (id: string) => {
    return users.find(u => u.id === id);
  };

  const getDoctors = () => {
    return users.filter(u => u.role === 'doctor' && u.isActive);
  };

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    getUser,
    getDoctors,
  };
}
