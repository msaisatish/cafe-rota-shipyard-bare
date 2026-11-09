import { NextResponse, type NextRequest } from 'next/server';

import { routeAccess } from '@/lib/access/guards';
import { publishWeek } from '@/lib/rota/service';
import { publishWeekSchema } from '@/lib/rota/schema';
import { validateBody } from '@/seams/validate';

/** `POST /api/rota/publish` — the manager makes a week visible to staff. */
export async function POST(request: NextRequest) {
  const access = await routeAccess('MANAGER');
  if (!access.ok) return access.response;

  const input = await validateBody(request, publishWeekSchema);
  if (!input.ok) return NextResponse.json({ error: input.message }, { status: 400 });

  await publishWeek(input.data.weekStart);
  return NextResponse.json({ ok: true });
}
