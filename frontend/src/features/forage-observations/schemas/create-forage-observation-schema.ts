import {
  z,
} from 'zod';

const forageTypes = [
  'meadow',
  'forest',
  'sunflower',
  'acacia',
  'linden',
  'oilseedRape',
  'clover',
  'fruitTrees',
  'chestnut',
  'buckwheat',
  'other',
] as const;

const coordinateText =
  /^-?\d+(?:[.,]\d+)?$/;

export const createForageObservationSchema =
  z.object({
    forageType: z
      .enum(forageTypes)
      .nullable()
      .refine(
        (value) => value !== null,
        'Izaberite vrstu paše.',
      ),
    intensity: z.number().int().min(1).max(5),
    notes: z
      .string()
      .trim()
      .max(
        1000,
        'Napomena može imati najviše 1000 karaktera.',
      ),
    latitude: z
      .string()
      .trim()
      .regex(
        coordinateText,
        'Unesite ispravnu geografsku širinu.',
      )
      .transform((value) =>
        Number(value.replace(',', '.')),
      )
      .refine(
        (value) => value >= -90 && value <= 90,
        'Geografska širina mora biti između -90 i 90.',
      ),
    longitude: z
      .string()
      .trim()
      .regex(
        coordinateText,
        'Unesite ispravnu geografsku dužinu.',
      )
      .transform((value) =>
        Number(value.replace(',', '.')),
      )
      .refine(
        (value) => value >= -180 && value <= 180,
        'Geografska dužina mora biti između -180 i 180.',
      ),
  });

export type CreateForageObservationFormInput =
  z.input<
    typeof createForageObservationSchema
  >;

export type CreateForageObservationFormValues =
  z.output<
    typeof createForageObservationSchema
  >;

export type ObservationForageType =
  (typeof forageTypes)[number];
