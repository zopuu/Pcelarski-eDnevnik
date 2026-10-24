import { z } from 'zod';

import { getCurrentUtcDateOnly, isDateOnly } from '@/shared/utils/date-only';

const hiveTypes = [
  'dadantBlatt',
  'langstrothRoot',
  'albertiZnidersic',
  'farrar',
  'nucleus',
  'other',
] as const;

const hiveMaterials = ['wood', 'polystyrene', 'polyurethane', 'plastic', 'other'] as const;

export const updateHiveSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, 'Oznaka košnice je obavezna.')
      .max(10, 'Oznaka može imati najviše 10 karaktera.'),

    identificationNumber: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || /^RS\d{8}$/.test(value),
        'Identifikacioni broj mora biti u formatu RS + 8 cifara.',
      ),

    type: z
      .enum(hiveTypes)
      .nullable()
      .refine((value) => value !== null, 'Tip košnice je obavezan.')
      .transform((value) => value!),

    colorHex: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || /^#[0-9A-Fa-f]{6}$/.test(value),
        'Boja mora biti u formatu #RRGGBB.',
      ),

    manufactureDate: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || isDateOnly(value),
        'Izaberite ispravan datum proizvodnje.',
      ),

    manufacturer: z.string().trim().max(80, 'Proizvođač može imati najviše 80 karaktera.'),

    material: z.enum(hiveMaterials).nullable(),

    purchaseDate: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || isDateOnly(value),
        'Izaberite ispravan datum nabavke.',
      ),

    hasFeeder: z.boolean(),

    feederVolumeMl: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || /^[1-9]\d*$/.test(value),
        'Zapremina mora biti ceo broj veći od nule.',
      ),

    note: z.string().trim().max(2000, 'Napomena može imati najviše 2.000 karaktera.'),
  })
  .superRefine((values, context) => {
    const today = getCurrentUtcDateOnly();

    if (values.manufactureDate && values.manufactureDate > today) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['manufactureDate'],
        message: 'Datum proizvodnje ne može biti u budućnosti.',
      });
    }

    if (values.purchaseDate && values.purchaseDate > today) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['purchaseDate'],
        message: 'Datum nabavke ne može biti u budućnosti.',
      });
    }

    if (
      values.manufactureDate &&
      values.purchaseDate &&
      values.manufactureDate > values.purchaseDate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['manufactureDate'],
        message: 'Datum proizvodnje ne može biti posle datuma nabavke.',
      });
    }

    if (values.hasFeeder && !values.feederVolumeMl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['feederVolumeMl'],
        message: 'Unesite zapreminu hranilice.',
      });
    }
  });

export type UpdateHiveFormInput = z.input<typeof updateHiveSchema>;
export type UpdateHiveFormValues = z.output<typeof updateHiveSchema>;
