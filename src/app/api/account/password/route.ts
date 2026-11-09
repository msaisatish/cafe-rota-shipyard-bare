import { NextResponse, type NextRequest } from 'next/server';

import { requireUser } from '@/components/auth/current-user';
import { memberForUser } from '@/lib/access/service';
import { chooseOwnPassword } from '@/lib/staff/service';
import { ownPasswordSchema } from '@/lib/staff/schema';
import { validateBody } from '@/seams/validate';

/** `POST /api/account/password` — a member replaces their starting password. */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const member = await memberForUser(auth.user.id);
  // Only to replace a starting password: without asking for the current one, an
  // open phone left signed in could otherwise be used to lock its owner out.
  if (!member?.mustChangePassword) {
    return NextResponse.json(
      { error: 'You do not need to change your password.' },
      { status: 403 },
    );
  }

  const input = await validateBody(request, ownPasswordSchema);
  if (!input.ok) {
    return NextResponse.json(
      { error: input.message, fieldErrors: input.fieldErrors },
      { status: 400 },
    );
  }

  const result = await chooseOwnPassword(auth.user, input.data.password);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
