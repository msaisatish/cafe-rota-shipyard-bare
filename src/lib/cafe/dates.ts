/**
 * Café calendar dates and wall-clock times.
 *
 * A shift is "Monday 07:00 to 15:00 at the café", whatever time zone a phone is
 * in, so days travel as `YYYY-MM-DD` strings and times as minutes after midnight.
 * Only "today" needs a time zone: the café's own.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  return toIsoDate(fromIsoDate(value)) === value;
}

/** The UTC-midnight Date the database stores for a café calendar date. */
export function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return toIsoDate(new Date(fromIsoDate(iso).getTime() + days * DAY_MS));
}

/** The Monday on or before a date: every week of the rota starts on a Monday. */
export function mondayOf(iso: string): string {
  const weekday = fromIsoDate(iso).getUTCDay();
  const sinceMonday = (weekday + 6) % 7;
  return addDays(iso, -sinceMonday);
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

/** One café, in one place: its clock decides what "today" and "upcoming" mean. */
const CAFE_TIME_ZONE = 'Europe/London';

export function cafeTimeZone(): string {
  return CAFE_TIME_ZONE;
}

/** Today's date at the café. */
export function cafeToday(now: Date = new Date(), timeZone: string = cafeTimeZone()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);
}

/** "Mon 16 Nov" */
export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(fromIsoDate(iso));
}

/** "Monday 16 November" */
export function formatLongDay(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(fromIsoDate(iso));
}

export function isTime(value: string): boolean {
  return TIME.test(value);
}

export function timeToMinutes(value: string): number {
  const match = TIME.exec(value);
  if (!match) throw new Error(`Not a time: ${value}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/** "07:00–15:00" */
export function formatShiftTime(startMinutes: number, endMinutes: number): string {
  return `${minutesToTime(startMinutes)}–${minutesToTime(endMinutes)}`;
}
