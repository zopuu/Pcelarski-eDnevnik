import { z } from 'zod';

import { getCurrentUtcDateOnly, isDateOnly } from '@/shared/utils/date-only';

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === '' || isDateOnly(value), 'Izaberite ispravan datum.');

export const changeQueenSchema = z
  .object({
    changedOn: z.string().trim().refine(isDateOnly, 'Datum promene je obavezan.'),
    currentQueenEndReason: z.enum([
      'replaced',
      'dead',
      'missing',
      'colonyWithoutQueen',
      'removed',
      'other',
    ]),
    currentQueenStatus: z.enum(['active', 'dead', 'missing', 'sold', 'removed']),
    source: z.enum(['new', 'existing']),
    existingQueenId: z.string(),
    markingColorHex: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || /^#[0-9A-Fa-f]{6}$/.test(value),
        'Boja mora biti HEX vrednost, npr. #FFFFFF.',
      ),
    origin: z.enum(['purchased', 'produced']).nullable(),
    breeder: z.string().max(100),
    breed: z.string().max(100),
    emergedOn: optionalDate,
    acquiredOn: optionalDate,
    notes: z.string().max(1000),
    introductionMethod: z.enum(['placement', 'caged', 'direct', 'unknown', 'other']).nullable(),
    newQueenStayNotes: z.string().max(1000),
  })
  .superRefine((values, context) => {
    const today = getCurrentUtcDateOnly();

    if (values.changedOn > today) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['changedOn'],
        message: 'Datum promene ne može biti u budućnosti.',
      });
    }

    if (values.source === 'existing' && !values.existingQueenId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['existingQueenId'],
        message: 'Izaberite postojeću maticu.',
      });
    }

    if (values.source === 'new' && !values.origin) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['origin'],
        message: 'Poreklo nove matice je obavezno.',
      });
    }

    if (!values.introductionMethod) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['introductionMethod'],
        message: 'Način uvođenja je obavezan.',
      });
    }

    if (values.emergedOn && values.acquiredOn && values.acquiredOn < values.emergedOn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['acquiredOn'],
        message: 'Datum nabavke ne može biti pre datuma izleganja.',
      });
    }

    if (values.source === 'new' && values.emergedOn && values.changedOn < values.emergedOn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['changedOn'],
        message: 'Promena ne može biti pre izleganja nove matice.',
      });
    }
  });

export type ChangeQueenFormValues = z.infer<typeof changeQueenSchema>;
