import { z } from 'zod';
import { isDateOnly } from '@/shared/utils/date-only';

const decimalText = /^\d+(?:[.,]\d{1,3})?$/;

export const harvestDataSchema = z.object({
  harvestedOn: z.string().refine(isDateOnly, 'Izaberite datum vrcanja.'),
  honeyAmount: z
    .string()
    .trim()
    .regex(decimalText, 'Unesite ispravnu količinu meda.')
    .transform((value) => Number(value.replace(',', '.')))
    .refine((value) => value > 0, 'Količina meda mora biti veća od nule.'),
  notes: z
    .string()
    .trim()
    .max(1000, 'Napomena može imati najviše 1000 karaktera.'),
});

export type HarvestDataFormInput = z.input<typeof harvestDataSchema>;
export type HarvestDataFormValues = z.output<typeof harvestDataSchema>;
