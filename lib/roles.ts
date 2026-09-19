import { UserRole } from './types';

export const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  doctor: 'Doctor',
  nurse: 'Enfermera',
  receptionist: 'Recepcionista',
};
