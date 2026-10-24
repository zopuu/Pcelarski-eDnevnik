import { z } from 'zod';

import { pattyTypes } from '../types/patty-feeding';
import { formatDateOnly, isDateOnly } from '@/shared/utils/date-only';

const percentage = z
  .string()
  .trim()
  .min(1, 'Unesite procenat pogače.')
  .refine((value) => {
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) {
      return false;
    }

    const parsed = Number(value.replace(',', '.'));

    return parsed > 0 && parsed <= 300;
  }, 'Procenat mora biti veći od 0 i najviše 300.');

export const recordPattyFeedingSchema = z.object({
  performedOn: z
    .string()
    .trim()
    .refine(isDateOnly, 'Izaberite datum prihrane.')
    .refine(
      (value) => value <= formatDateOnly(new Date()),
      'Datum prihrane ne može biti u budućnosti.',
    ),
  pattyMassG: z
    .string()
    .trim()
    .min(1, 'Unesite masu jedne pogače.')
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) > 0,
      'Masa mora biti pozitivan ceo broj grama.',
    ),
  pattyType: z.enum(pattyTypes),
  manufacturer: z.string().max(100, 'Proizvođač može imati najviše 100 znakova.'),
  notes: z.string().max(1000, 'Napomena može imati najviše 1000 znakova.'),
  hives: z
    .array(
      z.object({
        hiveId: z.string().uuid(),
        percentage,
      }),
    )
    .min(1, 'Izaberite najmanje jednu košnicu.'),
});

export type RecordPattyFeedingFormValues = z.infer<typeof recordPattyFeedingSchema>;
