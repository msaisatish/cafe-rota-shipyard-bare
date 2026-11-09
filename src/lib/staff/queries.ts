import { prisma } from '@/lib/prisma';
import { fromIsoDate } from '@/lib/cafe/dates';

/** One café, so every account and member belongs to it with no organisation to scope by. */

export async function emailIsTaken(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user !== null;
}

export async function createStaffAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: input, select: { id: true } });
    return tx.member.create({
      data: { userId: user.id, role: 'STAFF', mustChangePassword: true },
    });
  });
}

export async function findMember(memberId: string) {
  return prisma.member.findFirst({ where: { id: memberId, removedAt: null } });
}

/**
 * Someone leaves: they cannot sign in, their upcoming shifts come off the rota,
 * and swap asks involving them are turned down. User belongs to auth, so there
 * is no cascade to lean on: it is all done here, in one transaction.
 */
export async function retireMember(member: { id: string; userId: string }, today: string) {
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: member.userId }, data: { disabledAt: now } }),
    prisma.member.update({ where: { id: member.id }, data: { removedAt: now } }),
    prisma.swapRequest.updateMany({
      where: {
        status: 'WAITING',
        OR: [{ fromUserId: member.userId }, { toUserId: member.userId }],
      },
      data: { status: 'TURNED_DOWN', decidedAt: now },
    }),
    prisma.shift.deleteMany({
      where: { userId: member.userId, day: { gte: fromIsoDate(today) } },
    }),
  ]);
}

export async function saveOwnPassword(userId: string, passwordHash: string) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.member.updateMany({ where: { userId }, data: { mustChangePassword: false } }),
  ]);
}
