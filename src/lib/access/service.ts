import { countManagers, createManager, findActiveMember, findAnyMember } from './queries';

/**
 * The café member behind a signed-in account, or null if they are not on the
 * staff list.
 *
 * The very first account ever created becomes the manager: that is how the
 * café is set up, with no separate setup screen. Anyone who signs up after that
 * waits to be added by the manager.
 */
export async function memberForUser(userId: string) {
  const member = await findActiveMember(userId);
  if (member) return member;
  if (await findAnyMember(userId)) return null;
  if ((await countManagers()) > 0) return null;
  return createManager(userId);
}
