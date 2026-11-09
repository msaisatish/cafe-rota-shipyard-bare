import { checkPassword, hashPassword, normaliseEmail } from '@/components/auth/password';
import { createSession, revokeAllSessions } from '@/components/auth/session';
import { activePeople } from '@/lib/access/queries';
import { displayName } from '@/lib/access/rules';
import { cafeToday } from '@/lib/cafe/dates';

import {
  createStaffAccount,
  emailIsTaken,
  findMember,
  retireMember,
  saveOwnPassword,
} from './queries';
import type { NewStaff } from './schema';

export type StaffResult = { ok: true } | { ok: false; error: string; status: number };

export async function listStaff() {
  const people = await activePeople();
  return people.map((person) => ({
    memberId: person.memberId,
    name: displayName(person),
    email: person.email,
    isManager: person.role === 'MANAGER',
    hasOwnPassword: !person.mustChangePassword,
  }));
}

export type StaffRow = Awaited<ReturnType<typeof listStaff>>[number];

export async function addStaffMember(input: NewStaff): Promise<StaffResult> {
  const email = normaliseEmail(input.email);
  const check = checkPassword(input.password, { email, name: input.name });
  if (!check.ok) return { ok: false, error: check.issues[0] ?? 'Choose another.', status: 400 };
  if (await emailIsTaken(email)) {
    return { ok: false, error: 'That email address already has an account.', status: 409 };
  }
  const passwordHash = await hashPassword(input.password);
  await createStaffAccount({ name: input.name, email, passwordHash });
  return { ok: true };
}

export async function removeStaffMember(memberId: string, byUserId: string): Promise<StaffResult> {
  const member = await findMember(memberId);
  if (!member) return { ok: false, error: 'That person is no longer on the staff.', status: 404 };
  // The manager removing themselves would leave the café with nobody to plan it.
  if (member.userId === byUserId) {
    return { ok: false, error: 'You cannot remove yourself.', status: 409 };
  }
  await retireMember(member, cafeToday());
  await revokeAllSessions(member.userId);
  return { ok: true };
}

/** Replace the starting password, and sign out everywhere that knew the old one. */
export async function chooseOwnPassword(
  user: { id: string; email: string; name: string | null },
  password: string,
): Promise<StaffResult> {
  const context = { email: user.email, name: user.name ?? undefined };
  const check = checkPassword(password, context);
  if (!check.ok) return { ok: false, error: check.issues[0] ?? 'Choose another.', status: 400 };
  await saveOwnPassword(user.id, await hashPassword(password));
  await revokeAllSessions(user.id);
  await createSession(user.id);
  return { ok: true };
}
