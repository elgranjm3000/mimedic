export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getBcvRate } from '@/lib/exchange';

/** Tasa BCV USD→VES (requiere sesión). */
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { rate, updatedAt } = await getBcvRate();
  return NextResponse.json({ rate, updatedAt });
}
