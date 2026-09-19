export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, ensureDb } from '@/lib/db';
import { requireRequester, isNextResponse } from '@/lib/rest';

/** GET /api/auth/me — perfil propio + nombre de la organización (para documentos impresos). */
export async function GET(request: Request) {
  const requester = await requireRequester(request);
  if (isNextResponse(requester)) return requester;
  await ensureDb();

  const result = await db.execute({
    sql: `SELECT u.id, u.email, u."firstName", u."lastName", u.role, u."organizationId", u.avatar, u.signature, u."isActive", u."createdAt", u."updatedAt",
                 o.name AS "organizationName", o.currency AS "organizationCurrency"
          FROM users u LEFT JOIN organizations o ON o.id = u."organizationId"
          WHERE u.id = ?`,
    args: [requester.id],
  });
  const row = result.rows[0];
  return NextResponse.json({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    organizationCurrency: row.organizationCurrency ?? 'USD',
    avatar: row.avatar,
    signature: row.signature,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/** PATCH /api/auth/me — cada usuario edita su propio perfil. */
export async function PATCH(request: Request) {
  const requester = await requireRequester(request);
  if (isNextResponse(requester)) return requester;
  await ensureDb();
  const body = await request.json();

  const updates: string[] = [`"updatedAt" = ?`];
  const args: (string | null)[] = [new Date().toISOString()];

  if (typeof body.firstName === 'string' && body.firstName) {
    updates.push(`"firstName" = ?`);
    args.push(body.firstName);
  }
  if (typeof body.lastName === 'string' && body.lastName) {
    updates.push(`"lastName" = ?`);
    args.push(body.lastName);
  }
  if (typeof body.avatar === 'string' || body.avatar === null) {
    if (body.avatar && body.avatar.length > 500_000) {
      return NextResponse.json({ error: 'La imagen es demasiado grande' }, { status: 413 });
    }
    updates.push(`avatar = ?`);
    args.push(body.avatar);
  }
  if (typeof body.signature === 'string' || body.signature === null) {
    if (body.signature && body.signature.length > 500_000) {
      return NextResponse.json({ error: 'La imagen es demasiado grande' }, { status: 413 });
    }
    updates.push(`signature = ?`);
    args.push(body.signature);
  }

  // Cambio de contraseña: exige la actual
  if (body.newPassword) {
    if (typeof body.newPassword !== 'string' || body.newPassword.length < 6) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }
    const current = await db.execute({
      sql: `SELECT password_hash FROM users WHERE id = ?`,
      args: [requester.id],
    });
    const valid = await bcrypt.compare(body.currentPassword || '', current.rows[0].password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 403 });
    }
    updates.push(`password_hash = ?`);
    args.push(await bcrypt.hash(body.newPassword, 10));
  }

  args.push(requester.id);
  await db.execute({
    sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  const updated = await db.execute({
    sql: `SELECT id, email, "firstName", "lastName", role, "organizationId", avatar, signature, "isActive", "createdAt", "updatedAt"
          FROM users WHERE id = ?`,
    args: [requester.id],
  });
  const row = updated.rows[0];
  return NextResponse.json({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    organizationId: row.organizationId,
    avatar: row.avatar,
    signature: row.signature,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
