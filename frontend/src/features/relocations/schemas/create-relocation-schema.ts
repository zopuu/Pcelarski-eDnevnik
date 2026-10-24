import { z } from 'zod';

import { getCurrentUtcDateOnly, isDateOnly } from '@/shared/utils/date-only';

export const orientationValues = [
  'north',
  'northEast',
  'east',
  'southEast',
  'south',
  'southWest',
  'west',
  'northWest',
] as const;

export const transportMethodValues = ['trailer', 'truck', 'van', 'other'] as const;

const decimalInput = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) => {
        if (!value) {
          return true;
        }

        const number = Number(value.replace(',', '.'));

        return Number.isFinite(number) && number >= 0 && number <= maximum;
      },
      {
        message: `${label} nije ispravan.`,
      },
    );

const coordinateInput = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} je obavezna.`)
    .refine(
      (value) => {
        const number = Number(value.replace(',', '.'));

        return Number.isFinite(number) && number >= minimum && number <= maximum;
      },
      {
        message: `${label} nije ispravna.`,
      },
    );

export const createRelocationSchema = z
  .object({
    kind: z.enum(['wholeApiary', 'selectedHives']).nullable(),

    selectedHiveIds: z.array(z.string().uuid()),

    destinationMode: z.enum(['existing', 'new']),

    destinationLocationId: z.string().uuid().nullable(),

    destinationApiaryId: z.string().uuid().nullable(),

    destinationOrientation: z.enum(orientationValues).nullable(),

    destinationStayNote: z
      .string()
      .trim()
      .max(1000, 'Napomena o boravku može imati najviše 1000 karaktera.'),

    locationName: z.string().trim().max(80, 'Naziv lokacije može imati najviše 80 karaktera.'),

    latitude: coordinateInput('Geografska širina', -90, 90),

    longitude: coordinateInput('Geografska dužina', -180, 180),

    altitudeMeters: z
      .string()
      .trim()
      .refine((value) => !value || /^-?\d+$/.test(value), {
        message: 'Nadmorska visina mora biti ceo broj.',
      }),

    cadastralParcelNumber: z
      .string()
      .trim()
      .max(30, 'Broj parcele može imati najviše 30 karaktera.'),

    locationDescription: z
      .string()
      .trim()
      .max(1000, 'Opis lokacije može imati najviše 1000 karaktera.'),

    occurredAtDate: z
      .string()
      .trim()
      .refine((value) => isDateOnly(value) && value <= getCurrentUtcDateOnly(), {
        message: 'Izaberite datum koji nije u budućnosti.',
      }),

    occurredAtTime: z
      .string()
      .trim()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Vreme unesite u formatu HH:MM.'),

    transportMethod: z.enum(transportMethodValues).nullable(),

    distanceKm: decimalInput('Udaljenost', 999999.99),

    costAmount: decimalInput('Trošak', 9999999999.99),

    currencyCode: z
      .string()
      .trim()
      .refine((value) => !value || /^[A-Z]{3}$/.test(value), {
        message: 'Valuta mora imati tri velika slova, npr. RSD.',
      }),

    notes: z.string().trim().max(1000, 'Napomena može imati najviše 1000 karaktera.'),
  })
  .superRefine((values, context) => {
    const hasCost = values.costAmount.length > 0;
    const hasCurrency = values.currencyCode.length > 0;

    if (hasCost !== hasCurrency) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [hasCost ? 'currencyCode' : 'costAmount'],
        message: 'Trošak i valuta unose se zajedno.',
      });
    }
  });

export type CreateRelocationFormValues = z.infer<typeof createRelocationSchema>;
