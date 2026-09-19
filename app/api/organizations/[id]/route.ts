export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { db, ensureDb } from '@/lib/db';
import { requireRequester, isNextResponse } from '@/lib/rest';

/** Activa/desactiva o renombra una organización. Solo super admin. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const requester = await requireRequester(request);
  if (isNextResponse(requester)) return requester;
  if (requester.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo el super admin puede modificar organizaciones' }, { status: 403 });
  }
  await ensureDb();
  const body = await request.json();

  const updates: string[] = [`"updatedAt" = ?`];
  const args: (string | number)[] = [new Date().toISOString()];
  if (typeof body.name === 'string' && body.name) {
    updates.push(`name = ?`);
    args.push(body.name);
  }
  if (typeof body.type === 'string' && ['hospital', 'clinic', 'private_doctor'].includes(body.type)) {
    updates.push(`type = ?`);
    args.push(body.type);
  }
  if (typeof body.isActive === 'boolean') {
    updates.push(`"isActive" = ?`);
    args.push(body.isActive ? 1 : 0);
  }
  if (typeof body.currency === 'string' && body.currency) {
    updates.push(`currency = ?`);
    args.push(body.currency);
  }
  args.push(params.id);

  const result = await db.execute({
    sql: `UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const updated = await db.execute({
    sql: `SELECT id, name, type, "isActive", "createdAt", "updatedAt" FROM organizations WHERE id = ?`,
    args: [params.id],
  });
  const row = updated.rows[0];
  return NextResponse.json({
    id: row.id,
    name: row.name,
    type: row.type,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/** Elimina una organización solo si no tiene usuarios. Solo super admin. */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const requester = await requireRequester(request);
  if (isNextResponse(requester)) return requester;
  if (requester.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo el super admin puede eliminar organizaciones' }, { status: 403 });
  }
  await ensureDb();

  const members = await db.execute({
    sql: `SELECT COUNT(*) as count FROM users WHERE "organizationId" = ?`,
    args: [params.id],
  });
  if (Number(members.rows[0].count) > 0) {
    return NextResponse.json(
      { error: 'La organización todavía tiene usuarios. Desactívala o transfiere sus usuarios primero.' },
      { status: 409 }
    );
  }

  const result = await db.execute({
    sql: `DELETE FROM organizations WHERE id = ?`,
    args: [params.id],
  });
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
