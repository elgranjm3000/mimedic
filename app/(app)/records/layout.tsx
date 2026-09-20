'use client';

import { RoleGuard } from '@/components/role-guard';

export default function RecordsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'doctor', 'nurse']}>{children}</RoleGuard>;
}
