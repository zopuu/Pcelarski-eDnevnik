import { z } from 'zod';

export const addHiveSupersSchema = z.object({
  superCount: z
    .number()
    .int()
    .min(1, 'Unesite najmanje jedan nastavak.')
    .max(10, 'U jednoj akciji možete dodati najviše 10 nastavaka.'),
  supers: z
    .array(
      z.object({
        frameCount: z.number().int().min(1, 'Broj ramova mora biti veći od nule.'),
        colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Izaberite boju nastavka.'),
      }),
    )
    .min(1)
    .max(10),
});

export type AddHiveSupersFormValues = z.infer<typeof addHiveSupersSchema>;
