export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { makeItemHandlers, appointmentsConfig, requireRequester, isNextResponse } from '@/lib/rest';
import { findScheduleConflict } from '@/lib/schedule';

export const GET = makeItemHandlers(appointmentsConfig).GET;
export const DELETE = makeItemHandlers(appointmentsConfig).DELETE;

/** PATCH valida solapamiento de agenda antes de actualizar. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireRequester(request);
  if (isNextResponse(auth)) return auth;

  const body = await request.json();
  if (body.doctorId && body.date && body.time) {
    const conflict = await findScheduleConflict({
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      duration: Number(body.duration) || 30,
      excludeId: params.id,
    });
    if (conflict) {
      return NextResponse.json({ error: conflict }, { status: 409 });
    }
  }

  const replay = new Request(request.url, {
    method: 'PATCH',
    headers: request.headers,
    body: JSON.stringify(body),
  });
  return makeItemHandlers(appointmentsConfig).PATCH(replay, { params });
}
