import type { ColonyOrigin } from '@/features/colonies/types/colony';

import type {
  QueenIntroductionMethod,
  QueenIntroductionOutcome,
  QueenOrigin,
} from '@/features/queens/types/queen';

export type CreateColonyWithQueenRequest = {
  colonyOrigin: ColonyOrigin | null;

  colonyFormedOn: string | null;

  colonyStartedOn: string;

  colonyNotes: string | null;

  colonyStayNotes: string | null;

  queenMarkingColorHex: string | null;

  queenOrigin: QueenOrigin | null;

  queenBreeder: string | null;

  queenBreed: string | null;

  queenEmergedOn: string | null;

  queenAcquiredOn: string | null;

  queenNotes: string | null;

  queenStartedOn: string;

  queenIntroductionMethod: QueenIntroductionMethod | null;

  queenIntroductionOutcome: QueenIntroductionOutcome | null;

  queenStayNotes: string | null;
};

export type CreateColonyWithQueenResponse = {
  colonyId: string;
  colonyStayId: string;
  queenId: string;
  queenStayId: string;
};
