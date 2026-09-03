import {
  z,
} from 'zod';

import {
  getCurrentUtcDateOnly,
  isDateOnly,
} from '@/shared/utils/date-only';

const hiveTypes = [
  'dadantBlatt',
  'langstrothRoot',
  'albertiZnidersic',
  'farrar',
  'nucleus',
  'other',
] as const;

const hiveMaterials = [
  'wood',
  'polystyrene',
  'polyurethane',
  'plastic',
  'other',
] as const;

export const createHiveSchema =
  z.object({
    label:
      z
        .string()
        .trim()
        .min(
          1,
          'Oznaka košnice je obavezna.',
        )
        .max(
          10,
          'Oznaka može imati najviše 10 karaktera.',
        ),

    identificationNumber:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value.length === 0 ||
            /^RS\d{8}$/.test(
              value,
            ),
          {
            message:
              'Identifikacioni broj mora biti u formatu RS + 8 cifara.',
          },
        ),

    type:
      z
        .enum(
          hiveTypes,
        )
        .nullable()
        .refine(
          (value) =>
            value !== null,
          {
            message:
              'Tip košnice je obavezan.',
          },
        )
        .transform(
          (value) =>
            value!,
        ),

    colorHex:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value.length === 0 ||
            /^#[0-9A-Fa-f]{6}$/.test(
              value,
            ),
          {
            message:
              'Boja mora biti u formatu #RRGGBB.',
          },
        ),

    manufactureDate:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value.length === 0 ||
            isDateOnly(value),
          {
            message:
              'Izaberite ispravan datum proizvodnje.',
          },
        ),

    manufacturer:
      z
        .string()
        .trim()
        .max(
          80,
          'Proizvođač može imati najviše 80 karaktera.',
        ),

    material:
      z
        .enum(
          hiveMaterials,
        )
        .nullable(),

    purchaseDate:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value.length === 0 ||
            isDateOnly(value),
          {
            message:
              'Izaberite ispravan datum nabavke.',
          },
        ),
  }).superRefine(
    (
      values,
      context,
    ) => {
      const today =
        getCurrentUtcDateOnly();

      if (
        values.manufactureDate &&
        values.manufactureDate > today
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['manufactureDate'],
          message:
            'Datum proizvodnje ne može biti u budućnosti.',
        });
      }

      if (
        values.purchaseDate &&
        values.purchaseDate > today
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['purchaseDate'],
          message:
            'Datum nabavke ne može biti u budućnosti.',
        });
      }

      if (
        values.manufactureDate &&
        values.purchaseDate &&
        values.manufactureDate >
          values.purchaseDate
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['manufactureDate'],
          message:
            'Datum proizvodnje ne može biti posle datuma nabavke.',
        });
      }
    },
  );

export type CreateHiveFormInput =
  z.input<
    typeof createHiveSchema
  >;

export type CreateHiveFormValues =
  z.output<
    typeof createHiveSchema
  >;
