import {
  z,
} from 'zod';

import {
  isDateOnly,
} from '@/shared/utils/date-only';

const optionalDate =
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        isDateOnly(value),
      'Izaberite ispravan datum.',
    );

const requiredDate =
  z
    .string()
    .trim()
    .refine(
      isDateOnly,
      'Datum boravka je obavezan.',
    );

export const createColonyWithQueenSchema =
  z
    .object({
      colonyOrigin:
        z
          .enum([
            'swarm',
            'purchased',
            'split',
          ])
          .nullable(),

      colonyFormedOn:
        optionalDate,

      colonyStartedOn:
        requiredDate,

      colonyNotes:
        z
          .string()
          .max(1000),

      colonyStayNotes:
        z
          .string()
          .max(1000),

      queenMarkingColorHex:
        z
          .string()
          .trim()
          .refine(
            (value) =>
              value === '' ||
              /^#[0-9A-Fa-f]{6}$/
                .test(value),
            'Boja mora biti HEX vrednost, npr. #FFFFFF.',
          ),

      queenOrigin:
        z
          .enum([
            'purchased',
            'produced',
          ])
          .nullable(),

      queenBreeder:
        z
          .string()
          .max(100),

      queenBreed:
        z
          .string()
          .max(100),

      queenEmergedOn:
        optionalDate,

      queenAcquiredOn:
        optionalDate,

      queenNotes:
        z
          .string()
          .max(1000),

      queenStartedOn:
        requiredDate,

      queenIntroductionMethod:
        z
          .enum([
            'placement',
            'caged',
            'direct',
            'unknown',
            'other',
          ])
          .nullable(),

      queenIntroductionOutcome:
        z
          .enum([
            'accepted',
            'killed',
            'missing',
            'unverified',
            'other',
          ])
          .nullable(),

      queenStayNotes:
        z
          .string()
          .max(1000),
    })
    .superRefine(
      (
        values,
        context,
      ) => {
        if (
          values.colonyFormedOn &&
          values.colonyStartedOn <
            values.colonyFormedOn
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              'colonyStartedOn',
            ],

            message:
              'Boravak ne može početi pre formiranja društva.',
          });
        }

        if (
          values.queenEmergedOn &&
          values.queenAcquiredOn &&
          values.queenAcquiredOn <
            values.queenEmergedOn
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              'queenAcquiredOn',
            ],

            message:
              'Datum nabavke ne može biti pre datuma izleganja.',
          });
        }

        if (
          values.queenEmergedOn &&
          values.queenStartedOn <
            values.queenEmergedOn
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              'queenStartedOn',
            ],

            message:
              'Boravak matice ne može početi pre njenog izleganja.',
          });
        }

        if (
          values.queenStartedOn <
          values.colonyStartedOn
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              'queenStartedOn',
            ],

            message:
              'Matica ne može biti uvedena pre početka boravka društva.',
          });
        }
      },
    );

export type CreateColonyWithQueenFormValues =
  z.infer<
    typeof createColonyWithQueenSchema
  >;
