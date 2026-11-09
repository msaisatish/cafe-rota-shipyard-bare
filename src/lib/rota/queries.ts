import { prisma } from '@/lib/prisma';
import { fromIsoDate, toIsoDate } from '@/lib/cafe/dates';

/** One café, so weeks and shifts belong to it with no organisation to scope by. */

export async function findWeekWithShifts(weekStart: string) {
  const week = await prisma.week.findUnique({
    where: { startsOn: fromIsoDate(weekStart) },
    include: { shifts: { orderBy: [{ day: 'asc' }, { startMinutes: 'asc' }] } },
  });
  if (!week) return null;
  return {
    id: week.id,
    isPublished: week.publishedAt !== null,
    shifts: week.shifts.map((shift) => ({ ...shift, day: toIsoDate(shift.day) })),
  };
}

export async function shiftsOnDay(userId: string, day: string) {
  const shifts = await prisma.shift.findMany({ where: { userId, day: fromIsoDate(day) } });
  return shifts.map((shift) => ({ ...shift, day: toIsoDate(shift.day) }));
}

export async function createShift(shift: {
  weekStart: string;
  day: string;
  startMinutes: number;
  endMinutes: number;
  userId: string;
}) {
  const startsOn = fromIsoDate(shift.weekStart);
  const week = await prisma.week.upsert({ where: { startsOn }, update: {}, create: { startsOn } });
  return prisma.shift.create({
    data: {
      weekId: week.id,
      day: fromIsoDate(shift.day),
      startMinutes: shift.startMinutes,
      endMinutes: shift.endMinutes,
      userId: shift.userId,
    },
  });
}

/** Removing a shift also removes any swap requests for it (database cascade, same feature). */
export async function deleteShift(shiftId: string): Promise<boolean> {
  const result = await prisma.shift.deleteMany({ where: { id: shiftId } });
  return result.count > 0;
}

export async function markWeekPublished(weekStart: string) {
  const startsOn = fromIsoDate(weekStart);
  const publishedAt = new Date();
  return prisma.week.upsert({
    where: { startsOn },
    update: { publishedAt },
    create: { startsOn, publishedAt },
  });
}
