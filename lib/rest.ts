import { NextResponse } from 'next/server';
import { InValue } from '@libsql/client';
import { db, ensureDb } from './db';
import { audit } from './audit';

export interface EntityConfig {
  table: string;
  columns: string[];
  jsonFields?: string[];
  numberFields?: string[];
  booleanFields?: string[];
  /** si la tabla es multi-tenant, la columna organizationId debe estar en columns */
  tenant?: boolean;
}

export interface Requester {
  id: string;
  role: string;
  organizationId: string | null;
}

/** Resuelve el usuario que llama vía el header x-user-id (sesión del cliente). */
export async function getRequester(request: Request): Promise<Requester | null> {
  const userId = request.headers.get('x-user-id');
  if (!userId) return null;
  const result = await db.execute({
    sql: `SELECT id, role, "organizationId" FROM users WHERE id = ? AND "isActive" = 1`,
    args: [userId],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id as string,
    role: row.role as string,
    organizationId: (row.organizationId as string | null) ?? null,
  };
}

/** 401 si no hay sesión válida. */
export async function requireRequester(request: Request): Promise<Requester | NextResponse> {
  const requester = await getRequester(request);
  if (!requester) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  return requester;
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

/** Log de auditoría de una operación sobre una entidad. Best-effort. */
async function logOp(
  requester: Requester,
  request: Request,
  action: string,
  config: EntityConfig,
  entityId?: string | null,
  detail?: string
): Promise<void> {
  try {
    const u = await db.execute({
      sql: `SELECT email, "firstName", "lastName" FROM users WHERE id = ?`,
      args: [requester.id],
    });
    const row = u.rows[0];
    await audit(
      {
        userId: requester.id,
        userEmail: (row?.email as string) ?? null,
        userName: row ? `${row.firstName} ${row.lastName}` : null,
        organizationId: requester.organizationId,
        action,
        entity: config.table,
        entityId: entityId ?? null,
        detail: detail ?? null,
      },
      request
    );
  } catch {
    // nunca bloquear la operación por un fallo de auditoría
  }
}

/** Organización efectiva para filtrar: la del usuario, o la que un super_admin pida por query param. */
function effectiveOrgId(request: Request, requester: Requester): string | null {
  if (requester.role === 'super_admin') {
    return new URL(request.url).searchParams.get('organizationId');
  }
  return requester.organizationId;
}

function serialize(config: EntityConfig, data: Record<string, unknown>): Record<string, InValue> {
  const row: Record<string, InValue> = {};
  for (const col of config.columns) {
    let value = data[col];
    if (value === undefined) value = null;
    if (config.jsonFields?.includes(col) && value !== null) {
      value = JSON.stringify(value);
    }
    if (config.booleanFields?.includes(col) && value !== null) {
      value = value ? 1 : 0;
    }
    row[`"${col}"`] = value as InValue;
  }
  return row;
}

function deserialize(config: EntityConfig, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of config.columns) {
    let value = row[col];
    if (config.jsonFields?.includes(col) && typeof value === 'string') {
      value = JSON.parse(value);
    }
    if (config.numberFields?.includes(col) && value !== null) {
      value = Number(value);
    }
    if (config.booleanFields?.includes(col) && value !== null) {
      value = Boolean(value);
    }
    out[col] = value;
  }
  return out;
}

export function makeCollectionHandlers(config: EntityConfig) {
  const cols = config.columns.map(c => `"${c}"`).join(', ');

  const GET = async (request: Request) => {
    const requester = await requireRequester(request);
    if (isNextResponse(requester)) return requester;
    await ensureDb();

    if (config.tenant) {
      const orgId = effectiveOrgId(request, requester);
      if (orgId) {
        const result = await db.execute({
          sql: `SELECT ${cols} FROM "${config.table}" WHERE "organizationId" = ? ORDER BY "createdAt" DESC`,
          args: [orgId],
        });
        await logOp(requester, request, 'view', config);
        return NextResponse.json(result.rows.map(r => deserialize(config, r as unknown as Record<string, unknown>)));
      }
      if (requester.role !== 'super_admin') {
        return NextResponse.json({ error: 'El usuario no pertenece a ninguna organización' }, { status: 403 });
      }
    }

    const result = await db.execute(`SELECT ${cols} FROM "${config.table}" ORDER BY "createdAt" DESC`);
    await logOp(requester, request, 'view', config);
    return NextResponse.json(result.rows.map(r => deserialize(config, r as unknown as Record<string, unknown>)));
  };

  const POST = async (request: Request) => {
    const requester = await requireRequester(request);
    if (isNextResponse(requester)) return requester;
    await ensureDb();
    const body = await request.json();

    if (config.tenant) {
      const requestedOrg = body.organizationId ?? null;
      if (requester.role === 'super_admin') {
        if (!requestedOrg) {
          return NextResponse.json({ error: 'Como super admin debés indicar organizationId' }, { status: 400 });
        }
        body.organizationId = requestedOrg;
      } else {
        if (requestedOrg && requestedOrg !== requester.organizationId) {
          return NextResponse.json({ error: 'No podés crear registros en otra organización' }, { status: 403 });
        }
        body.organizationId = requester.organizationId;
      }
      if (!body.organizationId) {
        return NextResponse.json({ error: 'El usuario no pertenece a ninguna organización' }, { status: 403 });
      }
    }

    const now = new Date().toISOString();
    const data = { ...body, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    const row = serialize(config, data);
    const names = Object.keys(row).join(', ');
    const placeholders = Object.keys(row).map(() => '?').join(', ');
    await db.execute({ sql: `INSERT INTO "${config.table}" (${names}) VALUES (${placeholders})`, args: Object.values(row) });
    await logOp(requester, request, 'create', config, data.id as string);
    return NextResponse.json(deserialize(config, data), { status: 201 });
  };

  return { GET, POST };
}

export function makeItemHandlers(config: EntityConfig) {
  const cols = config.columns.map(c => `"${c}"`).join(', ');

  const GET = async (request: Request, { params }: { params: { id: string } }) => {
    const requester = await requireRequester(request);
    if (isNextResponse(requester)) return requester;
    await ensureDb();

    const filters: string[] = ['id = ?'];
    const args: InValue[] = [params.id];
    if (config.tenant && requester.role !== 'super_admin') {
      filters.push('"organizationId" = ?');
      args.push(requester.organizationId as InValue);
    }
    const result = await db.execute({
      sql: `SELECT ${cols} FROM "${config.table}" WHERE ${filters.join(' AND ')}`,
      args,
    });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(deserialize(config, result.rows[0] as unknown as Record<string, unknown>));
  };

  const PATCH = async (request: Request, { params }: { params: { id: string } }) => {
    const requester = await requireRequester(request);
    if (isNextResponse(requester)) return requester;
    await ensureDb();
    const body = await request.json();

    // Verificar que el registro pertenece a la organización del usuario
    const existing = await db.execute({
      sql: `SELECT ${config.tenant ? '"organizationId"' : 'id'} FROM "${config.table}" WHERE id = ?`,
      args: [params.id],
    });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (config.tenant && requester.role !== 'super_admin') {
      const rowOrg = existing.rows[0].organizationId as string | null;
      if (rowOrg !== requester.organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const data: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const col of config.columns) {
      if (col in body) data[col] = body[col];
    }
    const row = Object.fromEntries(
      Object.keys(data).map(col => [col, serialize(config, { [col]: data[col] })[`"${col}"`]])
    );
    const assignments = Object.keys(row).map(k => `${k} = ?`).join(', ');
    const args = [...Object.values(row), params.id];
    await db.execute({
      sql: `UPDATE "${config.table}" SET ${assignments} WHERE id = ?`,
      args,
    });
    await logOp(requester, request, 'update', config, params.id);
    const updated = await db.execute({
      sql: `SELECT ${cols} FROM "${config.table}" WHERE id = ?`,
      args: [params.id],
    });
    return NextResponse.json(deserialize(config, updated.rows[0] as unknown as Record<string, unknown>));
  };

  const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
    const requester = await requireRequester(request);
    if (isNextResponse(requester)) return requester;
    await ensureDb();

    const filters: string[] = ['id = ?'];
    const args: InValue[] = [params.id];
    if (config.tenant && requester.role !== 'super_admin') {
      filters.push('"organizationId" = ?');
      args.push(requester.organizationId as InValue);
    }
    const result = await db.execute({
      sql: `DELETE FROM "${config.table}" WHERE ${filters.join(' AND ')}`,
      args,
    });
    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await logOp(requester, request, 'delete', config, params.id);
    return NextResponse.json({ success: true });
  };

  return { GET, PATCH, DELETE };
}

export const patientsConfig: EntityConfig = {
  table: 'patients',
  columns: ['id', 'organizationId', 'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address', 'emergencyContact', 'emergencyPhone', 'medicalHistory', 'insuranceInfo', 'createdAt', 'updatedAt'],
  jsonFields: ['insuranceInfo'],
  tenant: true,
};

export const appointmentsConfig: EntityConfig = {
  table: 'appointments',
  columns: ['id', 'organizationId', 'patientId', 'patientName', 'doctorId', 'doctorName', 'date', 'time', 'duration', 'type', 'status', 'notes', 'createdAt', 'updatedAt'],
  numberFields: ['duration'],
  tenant: true,
};

export const prescriptionsConfig: EntityConfig = {
  table: 'prescriptions',
  columns: ['id', 'organizationId', 'patientId', 'patientName', 'doctorId', 'doctorName', 'appointmentId', 'recordId', 'medications', 'diagnosis', 'instructions', 'status', 'createdAt', 'updatedAt'],
  jsonFields: ['medications'],
  tenant: true,
};

export const invoicesConfig: EntityConfig = {
  table: 'invoices',
  columns: ['id', 'organizationId', 'patientId', 'patientName', 'appointmentId', 'items', 'subtotal', 'tax', 'total', 'status', 'dueDate', 'paidDate', 'paymentMethod', 'notes', 'createdAt', 'updatedAt'],
  jsonFields: ['items'],
  numberFields: ['subtotal', 'tax', 'total'],
  tenant: true,
};

export const usersConfig: EntityConfig = {
  table: 'users',
  columns: ['id', 'organizationId', 'email', 'firstName', 'lastName', 'role', 'avatar', 'signature', 'isActive', 'createdAt', 'updatedAt'],
  booleanFields: ['isActive'],
  tenant: true,
};

export const medicalRecordsConfig: EntityConfig = {
  table: 'medical_records',
  columns: ['id', 'organizationId', 'patientId', 'patientName', 'doctorId', 'doctorName', 'date', 'status', 'triageLevel', 'motivo', 'enfermedadActual', 'bloodPressure', 'heartRate', 'temperature', 'weight', 'height', 'oxygenSat', 'diagnostico', 'indicaciones', 'createdAt', 'updatedAt'],
  numberFields: ['heartRate', 'temperature', 'weight', 'height', 'oxygenSat'],
  tenant: true,
};

export const cashEntriesConfig: EntityConfig = {
  table: 'cash_entries',
  columns: ['id', 'organizationId', 'type', 'concept', 'amount', 'method', 'patientId', 'patientName', 'date', 'registeredBy', 'createdAt', 'updatedAt'],
  numberFields: ['amount'],
  tenant: true,
};

export const inventoryItemsConfig: EntityConfig = {
  table: 'inventory_items',
  columns: ['id', 'organizationId', 'name', 'category', 'unit', 'stock', 'minStock', 'cost', 'supplier', 'createdAt', 'updatedAt'],
  numberFields: ['stock', 'minStock', 'cost'],
  tenant: true,
};

export const stockMovementsConfig: EntityConfig = {
  table: 'stock_movements',
  columns: ['id', 'organizationId', 'itemId', 'itemName', 'type', 'quantity', 'reason', 'date', 'registeredBy', 'createdAt', 'updatedAt'],
  numberFields: ['quantity'],
  tenant: true,
};

export const organizationsConfig: EntityConfig = {
  table: 'organizations',
  columns: ['id', 'name', 'type', 'currency', 'isActive', 'createdAt', 'updatedAt'],
  booleanFields: ['isActive'],
};
