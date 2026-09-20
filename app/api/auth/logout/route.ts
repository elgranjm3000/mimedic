export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

/** POST /api/auth/logout — elimina la cookie de sesión. */
export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookie = clearSessionCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
