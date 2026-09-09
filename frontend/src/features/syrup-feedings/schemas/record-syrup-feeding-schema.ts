import { z } from 'zod';

import { formatDateOnly, isDateOnly } from '@/shared/utils/date-only';

const positiveDecimalMessage = 'Unesite pozitivan broj sa najviše četiri decimale.';

const positiveDecimal = z
  .string()
  .trim()
  .min(1, 'Ovo polje je obavezno.')
  .refine(
    (value) => /^\d+(?:[.,]\d{1,4})?$/.test(value) && Number(value.replace(',', '.')) > 0,
    positiveDecimalMessage,
  );

const fillPercentage = z
  .string()
  .trim()
  .min(1, 'Unesite procenat punjenja.')
  .refine(
    (value) => {
      if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) {
        return false;
      }

      const percentage = Number(value.replace(',', '.'));

      return percentage > 0 && percentage <= 100;
    },
    'Procenat mora biti veći od 0 i najviše 100.',
  );

export const recordSyrupFeedingSchema = z.object({
  performedOn: z
    .string()
    .trim()
    .refine(isDateOnly, 'Izaberite datum prihrane.')
    .refine(
      (value) => value <= formatDateOnly(new Date()),
      'Datum prihrane ne može biti u budućnosti.',
    ),
  sugarParts: positiveDecimal,
  waterParts: positiveDecimal,
  additives: z.string().max(500, 'Dodaci mogu imati najviše 500 znakova.'),
  notes: z.string().max(1000, 'Napomena može imati najviše 1000 znakova.'),
  hives: z
    .array(
      z.object({
        hiveId: z.string().uuid(),
        fillPercentage,
      }),
    )
    .min(1, 'Izaberite najmanje jednu košnicu.'),
});

export type RecordSyrupFeedingFormValues = z.infer<
  typeof recordSyrupFeedingSchema
>;
