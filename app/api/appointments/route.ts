export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { makeCollectionHandlers, makeItemHandlers, appointmentsConfig, requireRequester, isNextResponse } from '@/lib/rest';
import { findScheduleConflict } from '@/lib/schedule';

async function withConflictCheck(request: Request, excludeId?: string): Promise<Response> {
  const auth = await requireRequester(request);
  if (isNextResponse(auth)) return auth;

  const body = await request.json();
  const conflict = await findScheduleConflict({
    doctorId: body.doctorId,
    date: body.date,
    time: body.time,
    duration: Number(body.duration) || 30,
    excludeId,
  });
  if (conflict) {
    return NextResponse.json({ error: conflict }, { status: 409 });
  }

  // Delegar al handler genérico con un body reutilizable
  const replay = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify(body),
  });
  return excludeId
    ? makeItemHandlers(appointmentsConfig).PATCH(replay, { params: { id: excludeId } })
    : makeCollectionHandlers(appointmentsConfig).POST(replay);
}

export async function POST(request: Request) {
  return withConflictCheck(request);
}

export async function GET(request: Request) {
  return makeCollectionHandlers(appointmentsConfig).GET(request);
}
