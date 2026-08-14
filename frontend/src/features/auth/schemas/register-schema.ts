import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'Ime je obavezno.')
      .max(20, 'Ime može imati najviše 20 karaktera.'),

    lastName: z
      .string()
      .trim()
      .min(1, 'Prezime je obavezno.')
      .max(30, 'Prezime može imati najviše 30 karaktera.'),

    email: z
      .email('Unesite ispravnu email adresu.')
      .max(
        254,
        'Email može imati najviše 254 karaktera.',
      ),

    password: z
      .string()
      .min(1, 'Lozinka je obavezna.'),

    confirmPassword: z
      .string()
      .min(1, 'Potvrda lozinke je obavezna.'),

    hid: z
      .string()
      .trim()
      .max(
        12,
        'HID može imati najviše 12 karaktera.',
      ),

    phone: z
      .string()
      .trim()
      .max(
        20,
        'Telefon može imati najviše 20 karaktera.',
      ),

    agriculturalHoldingNumber: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === '' ||
          /^\d+$/.test(value),
        {
          message:
            'Broj gazdinstva mora biti ceo broj.',
        },
      )
      .refine(
        (value) =>
          value === '' ||
          Number(value) <= 2_147_483_647,
        {
          message:
            'Broj gazdinstva je prevelik.',
        },
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Lozinke se ne poklapaju.',
    },
  );

export type RegisterFormValues =
  z.infer<typeof registerSchema>;