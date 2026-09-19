export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, ensureDb } from '@/lib/db';
import { audit } from '@/lib/audit';

export async function POST(request: Request) {
  await ensureDb();
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
  }

  const result = await db.execute({
    sql: `SELECT u.id, u.email, u.password_hash, u."firstName", u."lastName", u.role, u."organizationId", u.avatar, u."isActive", u."createdAt", u."updatedAt",
                 o.name AS "organizationName", o."trialEndsAt" AS "trialEndsAt"
          FROM users u LEFT JOIN organizations o ON o.id = u."organizationId"
          WHERE u.email = ?`,
    args: [email],
  });

  if (result.rows.length === 0) {
    await audit({ userEmail: email, action: 'login_failed', detail: 'Email inexistente' }, request);
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const row = result.rows[0];
  if (!row.isActive) {
    await audit({ userId: row.id as string, userEmail: email, action: 'login_failed', detail: 'Usuario inactivo' }, request);
    return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, row.password_hash as string);
  if (!valid) {
    await audit({ userId: row.id as string, userEmail: email, action: 'login_failed', detail: 'Contraseña incorrecta' }, request);
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  await audit({
    userId: row.id as string,
    userEmail: row.email as string,
    userName: `${row.firstName} ${row.lastName}`,
    organizationId: (row.organizationId as string | null) ?? null,
    action: 'login',
  }, request);

  return NextResponse.json({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    trialEndsAt: row.trialEndsAt,
    avatar: row.avatar,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
