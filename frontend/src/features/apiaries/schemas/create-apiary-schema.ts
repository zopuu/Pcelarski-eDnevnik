import { z } from 'zod';

function coordinateSchema(
    fieldName: string,
    minimum: number,
    maximum: number,
) {
    return z
        .string()
        .trim()
        .min(
            1,
            `${fieldName} je obavezna.`,
        )
        .refine(
            (value) => {
                const number =
                    Number(
                        value.replace(',', '.'),
                    );

                return (
                    Number.isFinite(number) &&
                    number >= minimum &&
                    number <= maximum
                );
            },
            {
                message:
                    `${fieldName} nije ispravna.`,
            },
        );
}

export const createApiarySchema =
    z.object({
        name: z
            .string()
            .trim()
            .min(
                1,
                'Naziv pčelinjaka je obavezan.',
            )
            .max(
                30,
                'Naziv može imati najviše 30 karaktera.',
            ),

        identificationNumber: z
            .string()
            .trim()
            .refine(
                (value) =>
                    value.length === 0 ||
                    /^RS\d{12}$/.test(value),
                {
                    message:
                        'Broj mora biti u formatu RS + 12 cifara.',
                },
            ),

        type: z
            .enum([
                'stationary',
                'migratory',
            ], {
                error:
                    'Izaberite tip pčelinjaka.',
            }),

        locationName: z
            .string()
            .trim()
            .max(
                80,
                'Naziv lokacije može imati najviše 80 karaktera.',
            ),

        latitude: coordinateSchema(
            'Lokacija',
            -90,
            90,
        ),

        longitude: coordinateSchema(
            'Lokacija',
            -180,
            180,
        ),

        altitudeMeters: z
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

        cadastralParcelNumber: z
            .string()
            .trim()
            .max(
                30,
                'Broj parcele može imati najviše 30 karaktera.',
            ),

        description: z
            .string()
            .trim()
            .max(
                1000,
                'Opis može imati najviše 1000 karaktera.',
            ),
        orientation: z
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

        stayNote: z
            .string()
            .trim()
            .max(
                1000,
                'Napomena može imati najviše 1000 karaktera.',
            ),
    });

export type CreateApiaryFormValues =
    z.infer<
        typeof createApiarySchema
    >;
