import {
  z,
} from 'zod';

const optionalDate = z.string().refine(
  (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
  'Izaberite ispravan datum.',
);

export const updateQueenSchema = z.object({
  markingColorHex: z.string().refine(
    (value) => value === '' || /^#[0-9A-Fa-f]{6}$/.test(value),
    'Izaberite ispravnu boju oznake.',
  ),
  origin: z.enum(['purchased', 'produced', 'unknown']).nullable(),
  breeder: z.string().trim().max(100, 'Odgajivač može imati najviše 100 karaktera.'),
  breed: z.string().trim().max(100, 'Rasa može imati najviše 100 karaktera.'),
  emergedOn: optionalDate,
  acquiredOn: optionalDate,
  notes: z.string().trim().max(1000, 'Napomena može imati najviše 1.000 karaktera.'),
}).superRefine((values, context) => {
  if (
    values.emergedOn &&
    values.acquiredOn &&
    values.acquiredOn < values.emergedOn
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['acquiredOn'],
      message: 'Datum nabavke ne može biti pre datuma izleganja.',
    });
  }
});

export type UpdateQueenFormValues = z.infer<typeof updateQueenSchema>;
