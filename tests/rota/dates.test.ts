import { describe, expect, it } from 'vitest';

import {
  addDays,
  cafeToday,
  formatShiftTime,
  isIsoDate,
  mondayOf,
  timeToMinutes,
  weekDays,
} from '@/lib/cafe/dates';

describe('café dates', () => {
  it('starts every week on the Monday on or before a day', () => {
    expect(mondayOf('2026-11-16')).toBe('2026-11-16');
    expect(mondayOf('2026-11-22')).toBe('2026-11-16');
    expect(mondayOf('2026-11-19')).toBe('2026-11-16');
  });

  it('crosses months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(weekDays('2026-12-28')).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
  });

  it('refuses dates that do not exist', () => {
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('16/11/2026')).toBe(false);
    expect(isIsoDate('2026-11-16')).toBe(true);
  });

  it('reads and writes wall-clock times', () => {
    expect(timeToMinutes('07:30')).toBe(450);
    expect(formatShiftTime(420, 900)).toBe('07:00–15:00');
  });

  it('takes today from the café clock, not the server clock', () => {
    const lateEvening = new Date('2026-11-16T23:30:00Z');
    expect(cafeToday(lateEvening, 'Europe/London')).toBe('2026-11-16');
    expect(cafeToday(lateEvening, 'Europe/Berlin')).toBe('2026-11-17');
  });
});
