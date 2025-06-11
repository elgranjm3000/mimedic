'use client';

import { useRouter } from 'next/navigation';
import { UserForm } from '@/components/user-form';
import { useUsers } from '@/hooks/use-users';

export default function NewUserPage() {
  const router = useRouter();
  const { addUser } = useUsers();

  const handleSubmit = (userData: any) => {
    addUser(userData);
    router.push('/users');
  };

  const handleCancel = () => {
    router.push('/users');
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="text-gray-600 mt-1">
          Registra un nuevo usuario en el sistema
        </p>
      </div>
      
      <UserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}