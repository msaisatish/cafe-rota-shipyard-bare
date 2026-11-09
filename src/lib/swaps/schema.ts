import { z } from 'zod';

import { field } from '@/seams/validate';

export const askForSwapSchema = z.object({
  shiftId: field.id(),
  toUserId: z.string().min(1, 'Please choose who would take it.'),
});

export const decideSwapSchema = z.object({
  decision: z.enum(['approve', 'turn-down'], 'Please approve or turn it down.'),
});
