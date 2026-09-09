import { z } from 'zod';

import {
  formatDateOnly,
  isDateOnly,
} from '@/shared/utils/date-only';

import {
  varroaApplicationMethods,
  varroaDoseUnits,
} from '../types/varroa-treatment';

export const recordVarroaTreatmentSchema = z.object({
  performedOn: z
    .string()
    .trim()
    .refine(isDateOnly, 'Izaberite datum tretmana.')
    .refine(
      (value) => value <= formatDateOnly(new Date()),
      'Datum tretmana ne može biti u budućnosti.',
    ),
  productName: z
    .string()
    .trim()
    .min(1, 'Unesite naziv preparata.')
    .max(50, 'Naziv preparata može imati najviše 50 znakova.'),
  applicationMethod: z.enum(varroaApplicationMethods, {
    error: 'Izaberite način primene.',
  }),
  doseAmount: z
    .string()
    .trim()
    .min(1, 'Unesite dozu.')
    .refine(isValidDose, 'Unesite dozu od 0,01 do 99,99 sa najviše dve decimale.'),
  doseUnit: z.enum(varroaDoseUnits, {
    error: 'Izaberite jedinicu doze.',
  }),
  notes: z.string().max(1000, 'Napomena može imati najviše 1000 znakova.'),
  selectedHiveIds: z.array(z.string().uuid()).min(
    1,
    'Izaberite najmanje jednu košnicu.',
  ),
});

export type RecordVarroaTreatmentFormValues = z.infer<
  typeof recordVarroaTreatmentSchema
>;

function isValidDose(value: string) {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) {
    return false;
  }

  const doseAmount = Number(value.replace(',', '.'));

  return doseAmount > 0 && doseAmount <= 99.99;
}
