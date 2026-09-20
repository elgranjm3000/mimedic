export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getBcvRate } from '@/lib/exchange';
import { requireRequester, isNextResponse } from '@/lib/rest';

/** Tasa BCV USD→VES (requiere sesión). */
export async function GET(request: Request) {
  const auth = await requireRequester(request);
  if (isNextResponse(auth)) return auth;
  const { rate, updatedAt } = await getBcvRate();
  return NextResponse.json({ rate, updatedAt });
}
