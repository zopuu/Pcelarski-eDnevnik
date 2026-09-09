import { z } from 'zod';

import { formatDateOnly, isDateOnly } from '@/shared/utils/date-only';

const hiveSelectionSchema = z
  .object({
    hiveId: z.string().uuid(),
    paper: z.boolean(),
    eps: z.boolean(),
    xps: z.boolean(),
  })
  .refine((hive) => hive.paper || hive.eps || hive.xps, {
    message: 'Izaberite najmanje jedan materijal za svaku košnicu.',
    path: ['paper'],
  });

export const recordHiveInsulationSchema = z.object({
  performedOn: z
    .string()
    .trim()
    .refine(isDateOnly, 'Izaberite datum evidentiranja.')
    .refine(
      (value) => value <= formatDateOnly(new Date()),
      'Datum evidentiranja ne može biti u budućnosti.',
    ),
  operation: z.enum(['add', 'remove']),
  notes: z.string().max(1000, 'Napomena može imati najviše 1000 znakova.'),
  hives: z.array(hiveSelectionSchema).min(1, 'Izaberite najmanje jednu košnicu.'),
});

export type RecordHiveInsulationFormValues = z.infer<
  typeof recordHiveInsulationSchema
>;
