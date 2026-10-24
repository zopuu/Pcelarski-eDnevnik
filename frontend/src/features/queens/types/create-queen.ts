import type { QueenIntroductionMethod, QueenIntroductionOutcome, QueenOrigin } from './queen';

export type CreateQueenRequest = {
  markingColorHex: string | null;
  origin: QueenOrigin;
  breeder: string | null;
  breed: string | null;
  emergedOn: string | null;
  acquiredOn: string | null;
  notes: string | null;
  startedOn: string;
  introductionMethod: QueenIntroductionMethod;
  introductionOutcome: QueenIntroductionOutcome | null;
  stayNotes: string | null;
};

export type CreateQueenResponse = {
  queenId: string;
  queenStayId: string;
};
