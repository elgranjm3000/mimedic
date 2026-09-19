export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, ensureDb } from '@/lib/db';
import { requireRequester, isNextResponse } from '@/lib/rest';

/** Solo el super admin de la plataforma gestiona organizaciones. */
export async function GET(request: Request) {
  const requester = await requireRequester(request);
  if (isNextResponse(requester)) return requester;
  if (requester.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo el super admin puede ver las organizaciones' }, { status: 403 });
  }
  await ensureDb();
  const result = await db.execute(
    `SELECT id, name, type, currency, "isActive", "createdAt", "updatedAt" FROM organizations ORDER BY "createdAt" DESC`
  );
  return NextResponse.json(result.rows.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    currency: r.currency ?? 'USD',
    isActive: Boolean(r.isActive),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  })));
}

/** Crea una organización junto con su primer usuario admin. */
export async function POST(request: Request) {
  const requester = await requireRequester(request);
  if (isNextResponse(requester)) return requester;
  if (requester.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo el super admin puede crear organizaciones' }, { status: 403 });
  }
  await ensureDb();
  const body = await request.json();

  const { name, type, adminFirstName, adminLastName, adminEmail, adminPassword } = body;
  const currency = typeof body.currency === 'string' && body.currency ? body.currency : 'USD';
  if (!name || !['hospital', 'clinic', 'private_doctor'].includes(type)) {
    return NextResponse.json({ error: 'Nombre y tipo (hospital | clinic | private_doctor) son requeridos' }, { status: 400 });
  }
  if (!adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
    return NextResponse.json({ error: 'Los datos del admin (nombre, apellido, email, contraseña) son requeridos' }, { status: 400 });
  }

  const existingUser = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [adminEmail],
  });
  if (existingUser.rows.length > 0) {
    return NextResponse.json({ error: 'El email del admin ya está registrado' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const orgId = crypto.randomUUID();
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await db.batch([
    {
      sql: `INSERT INTO organizations (id, name, type, currency, "isActive", "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, 1, ?, ?)`,
      args: [orgId, name, type, currency, now, now],
    },
    {
      sql: `INSERT INTO users (id, email, password_hash, "firstName", "lastName", role, "organizationId", "isActive", "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, ?, 'admin', ?, 1, ?, ?)`,
      args: [crypto.randomUUID(), adminEmail, adminHash, adminFirstName, adminLastName, orgId, now, now],
    },
  ]);

  return NextResponse.json({
    id: orgId,
    name,
    type,
    currency,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }, { status: 201 });
}
