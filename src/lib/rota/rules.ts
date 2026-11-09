import { formatShiftTime, mondayOf } from '@/lib/cafe/dates';

export interface ShiftSlot {
  day: string;
  startMinutes: number;
  endMinutes: number;
  userId: string;
}

export function overlaps(a: ShiftSlot, b: ShiftSlot): boolean {
  if (a.userId !== b.userId || a.day !== b.day) return false;
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

/**
 * Why a new shift cannot go on the rota, or null if it can.
 *
 * One person cannot be in two places at once, so overlapping shifts for the
 * same person are refused rather than left for the manager to spot.
 */
export function shiftProblem(
  shift: ShiftSlot & { weekStart: string },
  existing: readonly ShiftSlot[],
): string | null {
  if (mondayOf(shift.day) !== shift.weekStart) return 'Please choose a day in this week.';
  if (shift.endMinutes <= shift.startMinutes) return 'Ends must be after starts.';
  const clash = existing.find((other) => overlaps(shift, other));
  if (clash) {
    const time = formatShiftTime(clash.startMinutes, clash.endMinutes);
    return `They are already working ${time} that day.`;
  }
  return null;
}
