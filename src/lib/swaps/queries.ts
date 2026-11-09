import { prisma } from '@/lib/prisma';
import { fromIsoDate, toIsoDate } from '@/lib/cafe/dates';

/** One café, so shifts and swaps belong to it with no organisation to scope by. */

export async function findShift(shiftId: string) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { week: { select: { publishedAt: true } } },
  });
  if (!shift) return null;
  return {
    userId: shift.userId,
    day: toIsoDate(shift.day),
    isPublished: shift.week.publishedAt !== null,
  };
}

export async function hasWaitingAsk(shiftId: string): Promise<boolean> {
  const count = await prisma.swapRequest.count({ where: { shiftId, status: 'WAITING' } });
  return count > 0;
}

export async function createSwapRequest(ask: {
  shiftId: string;
  fromUserId: string;
  toUserId: string;
}) {
  return prisma.swapRequest.create({ data: ask });
}

/** A person's own shifts in published weeks, from today on, soonest first. */
export async function upcomingPublishedShifts(userId: string, today: string) {
  const shifts = await prisma.shift.findMany({
    where: { userId, day: { gte: fromIsoDate(today) }, week: { publishedAt: { not: null } } },
    orderBy: [{ day: 'asc' }, { startMinutes: 'asc' }],
    include: {
      swaps: { where: { fromUserId: userId }, orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  return shifts.map((shift) => ({ ...shift, day: toIsoDate(shift.day) }));
}

export async function allSwapRequests() {
  const requests = await prisma.swapRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { shift: true },
    take: 200,
  });
  return requests.map((request) => ({
    ...request,
    shift: { ...request.shift, day: toIsoDate(request.shift.day) },
  }));
}

export async function findSwapRequest(swapId: string) {
  return prisma.swapRequest.findUnique({ where: { id: swapId }, include: { shift: true } });
}

/**
 * Approve: the shift moves to the colleague, and any other waiting asks for the
 * same shift are turned down, because it is no longer the asker's to give.
 */
export async function approveSwap(swap: { id: string; shiftId: string; toUserId: string }) {
  const now = new Date();
  await prisma.$transaction([
    prisma.shift.update({ where: { id: swap.shiftId }, data: { userId: swap.toUserId } }),
    prisma.swapRequest.update({
      where: { id: swap.id },
      data: { status: 'APPROVED', decidedAt: now },
    }),
    prisma.swapRequest.updateMany({
      where: { shiftId: swap.shiftId, status: 'WAITING', id: { not: swap.id } },
      data: { status: 'TURNED_DOWN', decidedAt: now },
    }),
  ]);
}

export async function turnDownSwap(swapId: string): Promise<boolean> {
  const result = await prisma.swapRequest.updateMany({
    where: { id: swapId, status: 'WAITING' },
    data: { status: 'TURNED_DOWN', decidedAt: new Date() },
  });
  return result.count > 0;
}
