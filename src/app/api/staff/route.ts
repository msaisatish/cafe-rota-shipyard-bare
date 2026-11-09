import { NextResponse, type NextRequest } from 'next/server';

import { routeAccess } from '@/lib/access/guards';
import { addStaffMember } from '@/lib/staff/service';
import { newStaffSchema } from '@/lib/staff/schema';
import { validateBody } from '@/seams/validate';

/** `POST /api/staff` — the manager adds a staff member with a starting password. */
export async function POST(request: NextRequest) {
  const access = await routeAccess('MANAGER');
  if (!access.ok) return access.response;

  const input = await validateBody(request, newStaffSchema);
  if (!input.ok) {
    return NextResponse.json(
      { error: input.message, fieldErrors: input.fieldErrors },
      { status: 400 },
    );
  }

  const result = await addStaffMember(input.data);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true }, { status: 201 });
}
