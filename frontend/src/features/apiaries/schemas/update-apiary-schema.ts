import {
  z,
} from 'zod';

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
  });

export type UpdateApiaryFormValues =
  z.infer<
    typeof updateApiarySchema
  >;