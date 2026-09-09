import { z } from 'zod';

import { formatDateOnly, isDateOnly } from '@/shared/utils/date-only';

const frameCount = z
  .number()
  .int('Broj ramova mora biti ceo broj.')
  .min(1, 'Izaberite od 1 do 10 ramova.')
  .max(10, 'Izaberite od 1 do 10 ramova.');

export const recordHoneyFrameFeedingSchema = z.object({
  performedOn: z
    .string()
    .trim()
    .refine(isDateOnly, 'Izaberite datum prihrane.')
    .refine(
      (value) => value <= formatDateOnly(new Date()),
      'Datum prihrane ne može biti u budućnosti.',
    ),
  frameSource: z
    .string()
    .max(100, 'Poreklo ramova može imati najviše 100 znakova.'),
  notes: z.string().max(1000, 'Napomena može imati najviše 1000 znakova.'),
  hives: z
    .array(
      z.object({
        hiveId: z.string().uuid(),
        frameCount,
      }),
    )
    .min(1, 'Izaberite najmanje jednu košnicu.'),
});

export type RecordHoneyFrameFeedingFormValues = z.infer<
  typeof recordHoneyFrameFeedingSchema
>;
