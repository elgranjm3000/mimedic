'use client';

import { RoleGuard } from '@/components/role-guard';

/** Guardia de ruta: todo /organizations es exclusivo del super admin. */
export default function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['super_admin']}>{children}</RoleGuard>;
}
