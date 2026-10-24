import { z } from 'zod';

import {
  broodPatterns,
  broodStages,
  hiveDiseases,
  hiveInspectionTypes,
  hivePests,
  hivePredators,
} from '../types/hive-inspection';

import { formatDateOnly, isDateOnly } from '@/shared/utils/date-only';

const rating = z
  .number()
  .int()
  .min(1, 'Ocena mora biti između 1 i 5.')
  .max(5, 'Ocena mora biti između 1 i 5.')
  .nullable();

const count = z
  .number()
  .int()
  .min(0, 'Broj ne može biti negativan.')
  .max(32767, 'Uneta vrednost je prevelika.')
  .nullable();

export const recordHiveInspectionSchema = z
  .object({
    performedOn: z.string().trim().refine(isDateOnly, 'Datum pregleda je obavezan.'),
    inspectionType: z.enum(hiveInspectionTypes).nullable(),
    overallConditionRating: rating,
    populationRating: rating,
    temperamentRating: rating,
    colonyStrength: rating,
    beeCoveredFrameCount: count,
    broodFrameCount: count,
    honeyFrameCount: count,
    pollenFrameCount: count,
    hasSwarmed: z.boolean().nullable(),
    honeyStoresRating: rating,
    pollenStoresRating: rating,
    broodCoveragePercentage: z
      .number()
      .int()
      .min(0, 'Procenat mora biti između 0 i 100.')
      .max(100, 'Procenat mora biti između 0 i 100.')
      .nullable(),
    openBroodFrameCount: count,
    cappedBroodFrameCount: count,
    broodPattern: z.enum(broodPatterns).nullable(),
    broodStage: z.enum(broodStages).nullable(),
    droneBroodPresent: z.boolean().nullable(),
    droneBroodExtent: rating,
    larvaePresence: rating,
    droneWorkerBalance: rating,
    broodQuality: rating,
    queenSeen: z.boolean().nullable(),
    queenMarked: z.boolean().nullable(),
    queenCellCount: count,
    queenCellStage: rating,
    swarmingTendency: rating,
    foodStoreAssessment: rating,
    pollenStoreAssessment: rating,
    starvationRisk: rating,
    varroaLevel: rating,
    disease: z.enum(hiveDiseases).nullable(),
    diseaseOther: z.string().trim().max(100, 'Opis bolesti može imati najviše 100 karaktera.'),
    pest: z.enum(hivePests).nullable(),
    pestOther: z.string().trim().max(100, 'Opis štetočine može imati najviše 100 karaktera.'),
    predator: z.enum(hivePredators).nullable(),
    predatorOther: z.string().trim().max(100, 'Opis predatora može imati najviše 100 karaktera.'),
    moldPresent: z.boolean().nullable(),
    excessMoisturePresent: z.boolean().nullable(),
    deadBeeLevel: rating,
    odor: rating,
    notes: z.string().trim().max(1000, 'Napomena može imati najviše 1.000 karaktera.'),
  })
  .superRefine((values, context) => {
    const today = formatDateOnly(new Date());

    if (values.performedOn > today) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['performedOn'],
        message: 'Datum pregleda ne može biti u budućnosti.',
      });
    }

    validateOtherDetail(
      values.disease,
      values.diseaseOther,
      'diseaseOther',
      'Unesite naziv druge bolesti.',
      context,
    );
    validateOtherDetail(
      values.pest,
      values.pestOther,
      'pestOther',
      'Unesite naziv druge štetočine.',
      context,
    );
    validateOtherDetail(
      values.predator,
      values.predatorOther,
      'predatorOther',
      'Unesite naziv drugog predatora.',
      context,
    );
  });

function validateOtherDetail(
  selection: string | null,
  detail: string,
  path: 'diseaseOther' | 'pestOther' | 'predatorOther',
  requiredMessage: string,
  context: z.RefinementCtx,
) {
  if (selection === 'OTHER' && detail.trim().length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: requiredMessage,
    });
  }

  if (selection !== 'OTHER' && detail.trim().length > 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: 'Dodatni opis je dozvoljen samo kada izaberete „Drugo“.',
    });
  }
}

export type RecordHiveInspectionFormValues = z.infer<typeof recordHiveInspectionSchema>;
