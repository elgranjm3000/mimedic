export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, ensureDb } from '@/lib/db';

export async function POST(request: Request) {
  await ensureDb();
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
  }

  const result = await db.execute({
    sql: `SELECT id, email, password_hash, "firstName", "lastName", role, "organizationId", avatar, "isActive", "createdAt", "updatedAt"
          FROM users WHERE email = ?`,
    args: [email],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const row = result.rows[0];
  if (!row.isActive) {
    return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, row.password_hash as string);
  if (!valid) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  return NextResponse.json({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    organizationId: row.organizationId,
    avatar: row.avatar,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
