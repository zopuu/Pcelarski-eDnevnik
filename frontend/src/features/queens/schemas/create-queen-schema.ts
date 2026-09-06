import {
  z,
} from 'zod';

import {
  getCurrentUtcDateOnly,
  isDateOnly,
} from '@/shared/utils/date-only';

const optionalDate = z.string().trim().refine(
  (value) => value === '' || isDateOnly(value),
  'Izaberite ispravan datum.',
);

export const createQueenSchema = z.object({
  markingColorHex: z.string().trim().refine(
    (value) => value === '' || /^#[0-9A-Fa-f]{6}$/.test(value),
    'Boja mora biti u formatu #RRGGBB.',
  ),
  origin: z.enum(['purchased', 'produced', 'unknown']).nullable().refine(
    (value) => value !== null,
    'Poreklo je obavezno.',
  ).transform((value) => value!),
  breeder: z.string().trim().max(100, 'Odgajivač može imati najviše 100 karaktera.'),
  breed: z.string().trim().max(100, 'Rasa može imati najviše 100 karaktera.'),
  emergedOn: optionalDate,
  acquiredOn: optionalDate,
  notes: z.string().trim().max(1000, 'Napomena može imati najviše 1.000 karaktera.'),
  startedOn: z.string().trim().refine(isDateOnly, 'Datum početka je obavezan.'),
  introductionMethod: z.enum([
    'placement', 'caged', 'direct', 'unknown', 'other',
  ]).nullable().refine(
    (value) => value !== null,
    'Način uvođenja je obavezan.',
  ).transform((value) => value!),
  introductionOutcome: z.enum([
    'accepted', 'killed', 'missing', 'unverified', 'other',
  ]).nullable(),
  stayNotes: z.string().trim().max(1000, 'Napomena može imati najviše 1.000 karaktera.'),
}).superRefine((values, context) => {
  const today = getCurrentUtcDateOnly();

  if (values.startedOn > today) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startedOn'],
      message: 'Datum početka ne može biti u budućnosti.',
    });
  }

  if (values.emergedOn && values.emergedOn > today) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['emergedOn'],
      message: 'Datum izleganja ne može biti u budućnosti.',
    });
  }

  if (values.acquiredOn && values.acquiredOn > today) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['acquiredOn'],
      message: 'Datum nabavke ne može biti u budućnosti.',
    });
  }

  if (values.emergedOn && values.acquiredOn && values.acquiredOn < values.emergedOn) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['acquiredOn'],
      message: 'Datum nabavke ne može biti pre datuma izleganja.',
    });
  }

  if (values.emergedOn && values.startedOn < values.emergedOn) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startedOn'],
      message: 'Boravak ne može početi pre datuma izleganja.',
    });
  }
});

export type CreateQueenFormInput = z.input<typeof createQueenSchema>;
export type CreateQueenFormValues = z.output<typeof createQueenSchema>;
