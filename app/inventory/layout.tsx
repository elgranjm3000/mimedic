'use client';

import { RoleGuard } from '@/components/role-guard';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'nurse']}>{children}</RoleGuard>;
}
