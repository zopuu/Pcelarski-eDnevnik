import {
  z,
} from 'zod';

import {
  getCurrentUtcDateOnly,
  isDateOnly,
} from '@/shared/utils/date-only';

export const endQueenStaySchema = z.object({
  endedOn: z.string().trim().refine(
    isDateOnly,
    'Datum završetka je obavezan.',
  ),

  endReason: z.enum([
    'dead',
    'killed',
    'sold',
    'removed',
    'swarmed',
    'colonyWithoutQueen',
    'other',
  ]),

  queenStatus: z.enum([
    'active',
    'dead',
    'killed',
    'sold',
    'removed',
  ]),
}).superRefine((values, context) => {
  if (values.endedOn > getCurrentUtcDateOnly()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endedOn'],
      message: 'Datum završetka ne može biti u budućnosti.',
    });
  }

  if (values.endReason === 'dead' && values.queenStatus !== 'dead') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['queenStatus'],
      message: 'Za uginulu maticu status mora biti „Uginula”.',
    });
  }

  if (values.endReason === 'killed' && values.queenStatus !== 'killed') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['queenStatus'],
      message: 'Za ubijenu maticu status mora biti „Ubijena”.',
    });
  }

  if (values.endReason === 'sold' && values.queenStatus !== 'sold') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['queenStatus'],
      message: 'Za prodatu maticu status mora biti „Prodata”.',
    });
  }

  if (values.endReason === 'removed' && values.queenStatus !== 'removed') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['queenStatus'],
      message: 'Za uklonjenu maticu status mora biti „Uklonjena”.',
    });
  }

  if (values.endReason === 'swarmed' && values.queenStatus !== 'active') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['queenStatus'],
      message: 'Izrojena matica ostaje aktivna.',
    });
  }
});

export type EndQueenStayFormValues = z.infer<
  typeof endQueenStaySchema
>;
