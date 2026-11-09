import { activePeople, namesFor } from '@/lib/access/queries';
import { displayName } from '@/lib/access/rules';
import { formatDay, formatShiftTime, mondayOf, timeToMinutes } from '@/lib/cafe/dates';

import {
  createShift,
  deleteShift,
  findWeekWithShifts,
  markWeekPublished,
  shiftsOnDay,
} from './queries';
import { shiftProblem } from './rules';
import type { NewShift } from './schema';

export interface PlannedShift {
  id: string;
  day: string;
  dayLabel: string;
  time: string;
  personName: string;
}

export async function loadWeekPlan(weekStart: string) {
  const [week, people] = await Promise.all([findWeekWithShifts(weekStart), activePeople()]);
  const shifts = week?.shifts ?? [];
  const names = await namesFor(shifts.map((shift) => shift.userId));
  const planned: PlannedShift[] = shifts.map((shift) => ({
    id: shift.id,
    day: shift.day,
    dayLabel: formatDay(shift.day),
    time: formatShiftTime(shift.startMinutes, shift.endMinutes),
    personName: names.get(shift.userId) ?? 'Someone who has left',
  }));
  return {
    isPublished: week?.isPublished ?? false,
    shifts: planned,
    people: people.map((person) => ({ userId: person.userId, name: displayName(person) })),
  };
}

export type AddShiftResult = { ok: true } | { ok: false; error: string };

export async function addShift(input: NewShift): Promise<AddShiftResult> {
  const people = await activePeople();
  if (!people.some((person) => person.userId === input.userId)) {
    return { ok: false, error: 'Please choose someone who works here.' };
  }
  const shift = {
    weekStart: input.weekStart,
    day: input.day,
    startMinutes: timeToMinutes(input.start),
    endMinutes: timeToMinutes(input.end),
    userId: input.userId,
  };
  const problem = shiftProblem(shift, await shiftsOnDay(input.userId, input.day));
  if (problem) return { ok: false, error: problem };
  await createShift(shift);
  return { ok: true };
}

export async function removeShift(shiftId: string): Promise<boolean> {
  return deleteShift(shiftId);
}

export async function publishWeek(weekStart: string): Promise<void> {
  await markWeekPublished(mondayOf(weekStart));
}
