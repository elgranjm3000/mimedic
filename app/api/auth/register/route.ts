export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, ensureDb } from '@/lib/db';
import { audit } from '@/lib/audit';

const TRIAL_DAYS = 7;

/**
 * POST /api/auth/register — registro público (prueba gratuita 7 días).
 * Crea la organización con trialEndsAt y su primer usuario admin.
 */
export async function POST(request: Request) {
  await ensureDb();
  const body = await request.json();

  const { orgName, type, currency, adminFirstName, adminLastName, adminEmail, adminPassword } = body;

  if (!orgName || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
  }
  if (!['hospital', 'clinic', 'private_doctor'].includes(type ?? '')) {
    return NextResponse.json({ error: 'Tipo de organización inválido' }, { status: 400 });
  }
  if (typeof adminPassword !== 'string' || adminPassword.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
  }

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [adminEmail],
  });
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'Ese email ya está registrado. Iniciá sesión.' }, { status: 409 });
  }

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();
  const orgId = crypto.randomUUID();
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await db.batch([
    {
      sql: `INSERT INTO organizations (id, name, type, currency, "trialEndsAt", "isActive", "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      args: [orgId, orgName, type, currency ?? 'USD', trialEndsAt, nowIso, nowIso],
    },
    {
      sql: `INSERT INTO users (id, email, password_hash, "firstName", "lastName", role, "organizationId", "isActive", "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, ?, 'admin', ?, 1, ?, ?)`,
      args: [crypto.randomUUID(), adminEmail, adminHash, adminFirstName, adminLastName, orgId, nowIso, nowIso],
    },
  ]);

  await audit({
    userEmail: adminEmail,
    userName: `${adminFirstName} ${adminLastName}`,
    organizationId: orgId,
    action: 'register',
    entity: 'organizations',
    entityId: orgId,
    detail: `Prueba gratuita de ${TRIAL_DAYS} días — ${orgName}`,
  }, request);

  return NextResponse.json({
    id: crypto.randomUUID(), // placeholder, el cliente inicia sesión con las credenciales
    email: adminEmail,
    firstName: adminFirstName,
    lastName: adminLastName,
    role: 'admin',
    organizationId: orgId,
    organizationName: orgName,
    trialEndsAt,
    isActive: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  }, { status: 201 });
}
