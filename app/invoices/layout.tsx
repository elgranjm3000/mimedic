'use client';

import { RoleGuard } from '@/components/role-guard';

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'receptionist']}>{children}</RoleGuard>;
}
