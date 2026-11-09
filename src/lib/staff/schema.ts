import { z } from 'zod';

import { field } from '@/seams/validate';

export const newStaffSchema = z.object({
  name: field.requiredText('their name').pipe(z.string().max(120, 'That name is too long.')),
  email: field.email(),
  password: z.string().min(12, 'The starting password needs at least 12 characters.'),
});

export type NewStaff = z.infer<typeof newStaffSchema>;

export const ownPasswordSchema = z
  .object({
    password: z.string().min(12, 'Your password needs at least 12 characters.'),
    confirm: z.string(),
  })
  .refine((input) => input.password === input.confirm, {
    path: ['confirm'],
    message: 'Those two do not match.',
  });
