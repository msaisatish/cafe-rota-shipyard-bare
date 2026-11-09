import { prisma } from '@/lib/prisma';

/** One café, so there is no organisation to scope by: every member belongs to it. */

export async function findActiveMember(userId: string) {
  return prisma.member.findFirst({ where: { userId, removedAt: null } });
}

export async function findAnyMember(userId: string) {
  return prisma.member.findUnique({ where: { userId } });
}

export async function countManagers(): Promise<number> {
  return prisma.member.count({ where: { role: 'MANAGER', removedAt: null } });
}

/** An upsert: the layout and the page both ask on the manager's first visit, at once. */
export async function createManager(userId: string) {
  return prisma.member.upsert({
    where: { userId },
    update: {},
    create: { userId, role: 'MANAGER' },
  });
}

export interface Person {
  userId: string;
  name: string | null;
  email: string;
  role: 'MANAGER' | 'STAFF';
  mustChangePassword: boolean;
  memberId: string;
}

/** Everyone currently working at the café, by name. */
export async function activePeople(): Promise<Person[]> {
  const members = await prisma.member.findMany({ where: { removedAt: null } });
  const users = await prisma.user.findMany({
    where: { id: { in: members.map((member) => member.userId) } },
    select: { id: true, name: true, email: true },
  });
  const byId = new Map(users.map((user) => [user.id, user]));
  const people = members.flatMap((member) => {
    const user = byId.get(member.userId);
    if (!user) return [];
    return [
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: member.role,
        mustChangePassword: member.mustChangePassword,
        memberId: member.id,
      },
    ];
  });
  return people.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
}

/** Names for a set of accounts, including people who have since left. */
export async function namesFor(userIds: readonly string[]): Promise<Map<string, string>> {
  const users = await prisma.user.findMany({
    where: { id: { in: [...new Set(userIds)] } },
    select: { id: true, name: true, email: true },
  });
  return new Map(users.map((user) => [user.id, user.name?.trim() || user.email]));
}
