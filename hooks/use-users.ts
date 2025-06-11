'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { storageUtils } from '@/lib/storage';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsers(storageUtils.getUsers());
    setLoading(false);
  }, []);

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser = storageUtils.addUser(userData);
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUser = storageUtils.updateUser(id, updates);
    if (updatedUser) {
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    }
    return updatedUser;
  };

  const deleteUser = (id: string) => {
    const success = storageUtils.deleteUser(id);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
    return success;
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