/**
 * Who may open which screen. Pure, so it is tested without a browser.
 */

export type Role = 'MANAGER' | 'STAFF';

export interface MemberAccess {
  role: Role;
  mustChangePassword: boolean;
}

export function homeFor(role: Role): string {
  return role === 'MANAGER' ? '/rota' : '/my-shifts';
}

/**
 * Where to send someone instead of the screen they asked for, or null to let
 * them in. A starting password is changed before anything else, because the
 * manager knows it.
 */
export function redirectFor(member: MemberAccess | null, required?: Role): string | null {
  if (!member) return '/not-on-staff';
  if (member.mustChangePassword) return '/change-password';
  if (required && member.role !== required) return homeFor(member.role);
  return null;
}

export function displayName(person: { name: string | null; email: string }): string {
  return person.name?.trim() || person.email;
}
