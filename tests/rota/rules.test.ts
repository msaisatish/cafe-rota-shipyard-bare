import { describe, expect, it } from 'vitest';

import { overlaps, shiftProblem } from '@/lib/rota/rules';

const sam = { day: '2026-11-16', startMinutes: 420, endMinutes: 720, userId: 'sam' };

describe('adding a shift', () => {
  it('accepts a shift in the week being planned', () => {
    const shift = { ...sam, weekStart: '2026-11-16' };
    expect(shiftProblem(shift, [])).toBeNull();
  });

  it('refuses a day outside the week', () => {
    const shift = { ...sam, day: '2026-11-23', weekStart: '2026-11-16' };
    expect(shiftProblem(shift, [])).toBe('Please choose a day in this week.');
  });

  it('refuses a shift that ends before it starts', () => {
    const shift = { ...sam, startMinutes: 900, endMinutes: 420, weekStart: '2026-11-16' };
    expect(shiftProblem(shift, [])).toBe('Ends must be after starts.');
  });

  it('refuses two overlapping shifts for one person', () => {
    const later = { ...sam, startMinutes: 660, endMinutes: 900, weekStart: '2026-11-16' };
    expect(shiftProblem(later, [sam])).toBe('They are already working 07:00–12:00 that day.');
  });

  it('allows back-to-back shifts and other people at the same time', () => {
    expect(overlaps(sam, { ...sam, startMinutes: 720, endMinutes: 900 })).toBe(false);
    expect(overlaps(sam, { ...sam, userId: 'alex' })).toBe(false);
    expect(overlaps(sam, { ...sam, day: '2026-11-17' })).toBe(false);
  });
});
