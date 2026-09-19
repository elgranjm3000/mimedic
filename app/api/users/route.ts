export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, ensureDb } from '@/lib/db';
import { makeCollectionHandlers, usersConfig, requireRequester, isNextResponse } from '@/lib/rest';

export const GET = makeCollectionHandlers(usersConfig).GET;

const ASSIGNABLE_ROLES = ['admin', 'doctor', 'nurse', 'receptionist'];

export async function POST(request: Request) {
  const requester = await requireRequester(request);
  if (isNextResponse(requester)) return requester;
  await ensureDb();
  const body = await request.json();

  if (!body.password) {
    return NextResponse.json({ error: 'La contraseña es requerida' }, { status: 400 });
  }
  if (!ASSIGNABLE_ROLES.includes(body.role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
  }

  // Solo el super admin puede crear admins; determina la organización destino
  let organizationId: string | null;
  if (requester.role === 'super_admin') {
    organizationId = body.organizationId ?? null;
    if (!organizationId) {
      return NextResponse.json({ error: 'Como super admin debés indicar organizationId' }, { status: 400 });
    }
  } else {
    if (!requester.organizationId) {
      return NextResponse.json({ error: 'Tu usuario no pertenece a ninguna organización' }, { status: 403 });
    }
    if (body.role === 'admin' && requester.role !== 'admin') {
      return NextResponse.json({ error: 'Solo un admin puede crear admins' }, { status: 403 });
    }
    organizationId = requester.organizationId;
  }

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [body.email],
  });
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(body.password, 10);

  await db.execute({
    sql: `INSERT INTO users (id, email, password_hash, "firstName", "lastName", role, "organizationId", "isActive", "createdAt", "updatedAt")
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [crypto.randomUUID(), body.email, passwordHash, body.firstName, body.lastName, body.role, organizationId, now, now],
  });

  const created = await db.execute({
    sql: `SELECT id, "organizationId", email, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt"
          FROM users WHERE email = ?`,
    args: [body.email],
  });
  const row = created.rows[0];
  return NextResponse.json({
    id: row.id,
    organizationId: row.organizationId,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }, { status: 201 });
}
