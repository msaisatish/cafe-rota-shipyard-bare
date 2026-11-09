import { NextResponse } from 'next/server';

import { routeAccess } from '@/lib/access/guards';
import { removeStaffMember } from '@/lib/staff/service';

/** `DELETE /api/staff/:id` — the manager removes someone who has left. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await routeAccess('MANAGER');
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const result = await removeStaffMember(id, access.user.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
