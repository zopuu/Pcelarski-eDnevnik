import {
  z,
} from 'zod';

function coordinateSchema(
  minimum: number,
  maximum: number,
) {
  return z
    .string()
    .trim()
    .min(
      1,
      'Lokacija je obavezna.',
    )
    .refine(
      (value) => {
        const coordinate =
          Number(
            value.replace(',', '.'),
          );

        return (
          Number.isFinite(coordinate) &&
          coordinate >= minimum &&
          coordinate <= maximum
        );
      },
      {
        message:
          'Lokacija nije ispravna.',
      },
    );
}

export const updateApiarySchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .max(
          30,
          'Naziv pčelinjaka može imati najviše 30 karaktera.',
        ),

    identificationNumber:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value === '' ||
            /^RS[0-9]{12}$/.test(
              value,
            ),
          {
            message:
              'Identifikacioni broj mora biti u formatu RS + 12 cifara.',
          },
        ),

    type:
      z
        .enum([
          'stationary',
          'migratory',
        ])
        .nullable(),

    latitude: coordinateSchema(
      -90,
      90,
    ),

    longitude: coordinateSchema(
      -180,
      180,
    ),

    altitudeMeters:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value.length === 0 ||
            /^-?\d+$/.test(value),
          {
            message:
              'Nadmorska visina mora biti ceo broj.',
          },
        ),

    orientation:
      z
        .enum([
          'north',
          'northEast',
          'east',
          'southEast',
          'south',
          'southWest',
          'west',
          'northWest',
        ])
        .nullable(),
  });

export type UpdateApiaryFormValues =
  z.infer<
    typeof updateApiarySchema
  >;
