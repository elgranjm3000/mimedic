'use client';

import { RoleGuard } from '@/components/role-guard';

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['super_admin']}>{children}</RoleGuard>;
}
