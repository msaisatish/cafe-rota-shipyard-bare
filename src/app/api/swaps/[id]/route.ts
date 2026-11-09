import { NextResponse, type NextRequest } from 'next/server';

import { routeAccess } from '@/lib/access/guards';
import { decideSwap } from '@/lib/swaps/service';
import { decideSwapSchema } from '@/lib/swaps/schema';
import { validateBody } from '@/seams/validate';

/** `POST /api/swaps/:id` — the manager approves or turns down a swap request. */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await routeAccess('MANAGER');
  if (!access.ok) return access.response;

  const input = await validateBody(request, decideSwapSchema);
  if (!input.ok) return NextResponse.json({ error: input.message }, { status: 400 });

  const { id } = await context.params;
  const result = await decideSwap(id, input.data.decision);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
