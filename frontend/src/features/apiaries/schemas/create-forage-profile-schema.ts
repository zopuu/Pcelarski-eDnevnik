import {
  z,
} from 'zod';

const selectableForageTypes = [
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
] as const;

const numericText =
  /^\d+(?:[.,]\d{1,2})?$/;

export const createForageProfileSchema =
  z.object({
    year:
      z
        .string()
        .trim()
        .regex(
          /^\d{4}$/,
          'Unesite godinu sa četiri cifre.',
        )
        .transform(Number)
        .refine(
          (value) => value > 0,
          'Godina mora biti veća od nule.',
        ),

    radiusKm:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value.length === 0 ||
            /^[1-4]$/.test(value),
          'Poluprečnik može biti od 1 do 4 km.',
        )
        .transform(
          (value) =>
            value.length === 0
              ? null
              : Number(value),
        ),

    name:
      z
        .string()
        .trim()
        .min(
          1,
          'Naziv profila je obavezan.',
        )
        .max(
          100,
          'Naziv može imati najviše 100 karaktera.',
        ),

    notes:
      z
        .string()
        .trim()
        .max(
          1000,
          'Napomena može imati najviše 1000 karaktera.',
        ),

    items:
      z
        .array(
          z.object({
            forageType:
              z
                .enum(selectableForageTypes)
                .nullable()
                .refine(
                  (value) => value !== null,
                  'Izaberite vrstu paše.',
                )
                .transform(
                  (value) => value!,
                ),

            percentage:
              z
                .string()
                .trim()
                .regex(
                  numericText,
                  'Unesite procenat sa najviše dve decimale.',
                )
                .transform(
                  (value) =>
                    Number(
                      value.replace(',', '.'),
                    ),
                )
                .refine(
                  (value) =>
                    value > 0 &&
                    value <= 100,
                  'Procenat mora biti između 0,01 i 100.',
                ),

            intensity:
              z
                .number()
                .int()
                .min(1)
                .max(5),

            notes:
              z
                .string()
                .trim()
                .max(
                  1000,
                  'Napomena može imati najviše 1000 karaktera.',
                ),
          }),
        )
        .min(
          1,
          'Dodajte najmanje jednu vrstu paše.',
        ),
  })
    .superRefine(
      (values, context) => {
        const usedForageTypes =
          new Set<string>();

        let totalPercentage = 0;

        values.items.forEach(
          (item, index) => {
            if (usedForageTypes.has(item.forageType)) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                path: [
                  'items',
                  index,
                  'forageType',
                ],
                message:
                  'Vrsta paše može biti izabrana samo jednom.',
              });
            }

            usedForageTypes.add(
              item.forageType,
            );

            totalPercentage +=
              item.percentage;
          },
        );

        const roundedTotal =
          Math.round(
            (totalPercentage + Number.EPSILON) *
              100,
          ) / 100;

        if (roundedTotal > 100) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items'],
            message:
              'Zbir procenata ne može biti veći od 100.',
          });
        }
      },
    );

export type CreateForageProfileFormInput =
  z.input<
    typeof createForageProfileSchema
  >;

export type CreateForageProfileFormValues =
  z.output<
    typeof createForageProfileSchema
  >;

export type SelectableForageType =
  (typeof selectableForageTypes)[number];
