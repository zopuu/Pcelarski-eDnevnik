import { z } from 'zod';

export const updateColonySchema = z.object({
  origin: z.enum(['swarm', 'purchased', 'split']).nullable(),

  formedOn: z
    .string()
    .refine(
      (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
      'Izaberite ispravan datum formiranja.',
    ),

  notes: z.string().trim().max(1000, 'Napomena može imati najviše 1.000 karaktera.'),
});

export type UpdateColonyFormValues = z.infer<typeof updateColonySchema>;
