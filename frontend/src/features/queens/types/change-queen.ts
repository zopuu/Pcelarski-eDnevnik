import type { QueenIntroductionMethod, QueenOrigin, QueenStatus } from './queen';

export type QueenStayEndReason =
  | 'replaced'
  | 'dead'
  | 'killed'
  | 'missing'
  | 'removed'
  | 'swarmed'
  | 'colonyEnded'
  | 'other'
  | 'transferred'
  | 'colonyWithoutQueen';

export type NewQueenForChange = {
  markingColorHex: string | null;
  origin: QueenOrigin | null;
  breeder: string | null;
  breed: string | null;
  emergedOn: string | null;
  acquiredOn: string | null;
  notes: string | null;
};

export type ChangeQueenRequest = {
  changedOn: string;
  currentQueenEndReason: QueenStayEndReason;
  currentQueenStatus: QueenStatus;
  existingQueenId: string | null;
  newQueen: NewQueenForChange | null;
  introductionMethod: QueenIntroductionMethod | null;
  newQueenStayNotes: string | null;
};

export type ChangeQueenResponse = {
  previousQueenId: string;
  previousQueenStayId: string;
  queenId: string;
  queenStayId: string;
};

export type AvailableQueen = {
  id: string;
  markingColorHex: string | null;
  origin: QueenOrigin | null;
  breeder: string | null;
  breed: string | null;
  emergedOn: string | null;
  acquiredOn: string | null;
  notes: string | null;
};
