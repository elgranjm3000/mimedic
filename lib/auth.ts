import jwt from 'jsonwebtoken';
import { db } from './db';
import { Requester } from './rest';

const COOKIE_NAME = 'mc_session';
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 días

function secret(): string {
  return process.env.JWT_SECRET || 'dev-only-insecure-secret';
}

/** Firma la sesión del usuario en una cookie httpOnly. */
export function sessionCookie(userId: string): { name: string; value: string; options: object } {
  const token = jwt.sign({ sub: userId }, secret(), { expiresIn: MAX_AGE_S });
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_S,
    },
  };
}

/** Cookie que elimina la sesión. */
export function clearSessionCookie() {
  return { name: COOKIE_NAME, value: '', options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 0 } };
}

/**
 * Resuelve el usuario desde la cookie JWT firmada.
 * A diferencia del header x-user-id, un cliente no puede falsificarla.
 */
export async function getSessionUser(request: Request): Promise<Requester | null> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  let userId: string;
  try {
    const payload = jwt.verify(match[1], secret()) as { sub?: string };
    userId = payload.sub ?? '';
  } catch {
    return null; // token inválido o expirado
  }
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
