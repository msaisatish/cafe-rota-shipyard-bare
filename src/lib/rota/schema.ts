import { z } from 'zod';

import { field } from '@/seams/validate';
import { isIsoDate, isTime } from '@/lib/cafe/dates';

const isoDate = (label: string) => z.string().refine(isIsoDate, `Please choose ${label}.`);

const time = (label: string) =>
  z.string().refine(isTime, `Please enter ${label} as a time, for example 07:30.`);

export const newShiftSchema = z
  .object({
    weekStart: isoDate('a week'),
    day: isoDate('a day'),
    start: time('when it starts'),
    end: time('when it ends'),
    userId: field.id(),
  })
  .refine((shift) => shift.end > shift.start, {
    path: ['end'],
    message: 'Ends must be after starts.',
  });

export type NewShift = z.infer<typeof newShiftSchema>;

export const publishWeekSchema = z.object({ weekStart: isoDate('a week') });

export const weekQuerySchema = z.object({ week: isoDate('a week').optional() });
