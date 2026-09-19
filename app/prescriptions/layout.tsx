'use client';

import { RoleGuard } from '@/components/role-guard';

export default function PrescriptionsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'doctor']}>{children}</RoleGuard>;
}
