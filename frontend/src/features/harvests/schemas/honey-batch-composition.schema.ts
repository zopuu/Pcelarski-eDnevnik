import { z } from 'zod';

const percentageText = /^\d+$/;

export const honeyBatchCompositionItemSchema = z.object({
  forageType: z
    .string()
    .trim()
    .min(1, 'Naziv vrste paše je obavezan.')
    .max(100, 'Naziv vrste paše može imati najviše 100 karaktera.'),
  percentage: z
    .string()
    .trim()
    .regex(percentageText, 'Procenat mora biti ceo broj.')
    .refine((value) => Number(value) >= 1, 'Procenat mora biti najmanje 1%.')
    .refine((value) => Number(value) <= 100, 'Procenat ne može biti veći od 100%.'),
  notes: z.string().trim().max(1000, 'Napomena može imati najviše 1000 karaktera.'),
});

const compositionItemsSchema = z
  .array(honeyBatchCompositionItemSchema)
  .min(1, 'Dodajte najmanje jednu stavku.')
  .superRefine((items, context) => {
    const usedForageTypes = new Set<string>();

    items.forEach((item, index) => {
      const normalizedName = item.forageType.toLocaleLowerCase('sr-Latn-RS');
      if (usedForageTypes.has(normalizedName)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, 'forageType'],
          message: 'Vrsta paše može biti uneta samo jednom.',
        });
      }
      usedForageTypes.add(normalizedName);
    });

    if (items.reduce((sum, item) => sum + Number(item.percentage), 0) !== 100) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ukupan procenat mora biti tačno 100%.',
      });
    }
  });

export const manualHoneyBatchCompositionSchema = z.object({
  items: compositionItemsSchema,
});

export const laboratoryHoneyBatchCompositionSchema = z.object({
  evidenceReference: z
    .string()
    .trim()
    .min(3, 'Unesite podatke o laboratorijskom nalazu.')
    .max(1000, 'Podaci o laboratorijskom nalazu mogu imati najviše 1000 karaktera.'),
  items: compositionItemsSchema,
});

export type HoneyBatchCompositionFormInput = {
  evidenceReference?: string;
  items: { forageType: string; percentage: string; notes: string }[];
};

export type ManualHoneyBatchCompositionFormValues = z.output<
  typeof manualHoneyBatchCompositionSchema
>;
export type LaboratoryHoneyBatchCompositionFormValues = z.output<
  typeof laboratoryHoneyBatchCompositionSchema
>;
