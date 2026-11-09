import { NextResponse } from 'next/server';

import { routeAccess } from '@/lib/access/guards';
import { removeShift } from '@/lib/rota/service';

/** `DELETE /api/rota/shifts/:id` — the manager takes a shift off the rota. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await routeAccess('MANAGER');
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const isRemoved = await removeShift(id);
  if (!isRemoved) {
    return NextResponse.json({ error: 'That shift is no longer on the rota.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
