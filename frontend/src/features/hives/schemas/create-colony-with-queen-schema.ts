import {
  z,
} from 'zod';

import {
  getCurrentUtcDateOnly,
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
        const today =
          getCurrentUtcDateOnly();

        const dateFields = [
          {
            name: 'colonyFormedOn',
            value: values.colonyFormedOn,
            label: 'Datum formiranja društva',
          },
          {
            name: 'colonyStartedOn',
            value: values.colonyStartedOn,
            label: 'Datum početka boravka društva',
          },
          {
            name: 'queenEmergedOn',
            value: values.queenEmergedOn,
            label: 'Datum izleganja matice',
          },
          {
            name: 'queenAcquiredOn',
            value: values.queenAcquiredOn,
            label: 'Datum nabavke matice',
          },
          {
            name: 'queenStartedOn',
            value: values.queenStartedOn,
            label: 'Datum početka boravka matice',
          },
        ] as const;

        dateFields.forEach(
          (field) => {
            if (
              field.value &&
              field.value > today
            ) {
              context.addIssue({
                code:
                  z.ZodIssueCode.custom,
                path: [field.name],
                message:
                  `${field.label} ne može biti u budućnosti.`,
              });
            }
          },
        );

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
          values.queenAcquiredOn &&
          values.colonyFormedOn &&
          values.queenAcquiredOn >
            values.colonyFormedOn
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              'queenAcquiredOn',
            ],

            message:
              'Datum nabavke matice ne može biti posle datuma formiranja društva.',
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
