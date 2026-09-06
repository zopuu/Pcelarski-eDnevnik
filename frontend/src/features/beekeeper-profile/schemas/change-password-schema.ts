import {
  z,
} from 'zod';

export const changePasswordSchema =
  z.object({
    currentPassword:
      z.string()
        .min(1, 'Unesite trenutnu lozinku.'),

    newPassword:
      z.string()
        .min(6, 'Nova lozinka mora imati najmanje 6 karaktera.')
        .max(100, 'Nova lozinka može imati najviše 100 karaktera.'),

    confirmNewPassword:
      z.string()
        .min(1, 'Potvrdite novu lozinku.'),
  })
    .refine(
      (data) =>
        data.newPassword ===
        data.confirmNewPassword,
      {
        path: ['confirmNewPassword'],
        message: 'Nove lozinke se ne poklapaju.',
      },
    );

export type ChangePasswordFormValues =
  z.infer<typeof changePasswordSchema>;
