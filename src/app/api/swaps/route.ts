import { NextResponse, type NextRequest } from 'next/server';

import { routeAccess } from '@/lib/access/guards';
import { askForSwap } from '@/lib/swaps/service';
import { askForSwapSchema } from '@/lib/swaps/schema';
import { validateBody } from '@/seams/validate';

/** `POST /api/swaps` — a staff member asks to hand one of their shifts to a colleague. */
export async function POST(request: NextRequest) {
  const access = await routeAccess('STAFF');
  if (!access.ok) return access.response;

  const input = await validateBody(request, askForSwapSchema);
  if (!input.ok) {
    return NextResponse.json(
      { error: input.message, fieldErrors: input.fieldErrors },
      { status: 400 },
    );
  }

  const result = await askForSwap({ ...input.data, fromUserId: access.user.id });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true }, { status: 201 });
}
