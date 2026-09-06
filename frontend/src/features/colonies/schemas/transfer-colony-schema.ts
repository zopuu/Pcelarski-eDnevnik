import {
  z,
} from 'zod';

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const transferColonySchema = z.object({
  destinationHiveId: z.string().uuid('Izaberite ciljnu košnicu.'),
  transferredOn: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Izaberite ispravan datum.')
    .refine(
      (value) => value <= getToday(),
      'Datum premeštanja ne može biti u budućnosti.',
    ),
});

export type TransferColonyFormValues =
  z.infer<typeof transferColonySchema>;
