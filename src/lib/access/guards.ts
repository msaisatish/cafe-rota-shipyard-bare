import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { currentUser, requireUser } from '@/components/auth/current-user';
import type { SessionUser } from '@/components/auth/session';

import { redirectFor, type Role } from './rules';
import { memberForUser } from './service';

export interface Access {
  user: SessionUser;
  member: { id: string; userId: string; role: Role; mustChangePassword: boolean };
}

/** For a screen: the signed-in member, or a redirect to where they belong. */
export async function pageAccess(required?: Role): Promise<Access> {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const member = await memberForUser(user.id);
  const elsewhere = redirectFor(member, required);
  if (elsewhere || !member) redirect(elsewhere ?? '/not-on-staff');
  return { user, member };
}

export type RouteAccess = ({ ok: true } & Access) | { ok: false; response: NextResponse };

/** For an endpoint: the signed-in member, or the refusal to send back. */
export async function routeAccess(required: Role): Promise<RouteAccess> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const member = await memberForUser(auth.user.id);
  if (!member || member.mustChangePassword || member.role !== required) {
    const error = 'You do not have permission to do that.';
    return { ok: false, response: NextResponse.json({ error }, { status: 403 }) };
  }
  return { ok: true, user: auth.user, member };
}
