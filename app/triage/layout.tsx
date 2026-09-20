'use client';

import { RoleGuard } from '@/components/role-guard';

export default function TriageLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>{children}</RoleGuard>;
}
