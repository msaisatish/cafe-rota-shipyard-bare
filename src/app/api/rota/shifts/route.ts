import { NextResponse, type NextRequest } from 'next/server';

import { routeAccess } from '@/lib/access/guards';
import { addShift } from '@/lib/rota/service';
import { newShiftSchema } from '@/lib/rota/schema';
import { validateBody } from '@/seams/validate';

/** `POST /api/rota/shifts` — the manager adds a shift to a week. */
export async function POST(request: NextRequest) {
  const access = await routeAccess('MANAGER');
  if (!access.ok) return access.response;

  const input = await validateBody(request, newShiftSchema);
  if (!input.ok) {
    return NextResponse.json(
      { error: input.message, fieldErrors: input.fieldErrors },
      { status: 400 },
    );
  }

  const result = await addShift(input.data);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
