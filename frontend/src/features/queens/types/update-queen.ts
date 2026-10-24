import type { QueenIntroductionOutcome, QueenOrigin, QueenStatus } from './queen';

export type UpdateQueenRequest = {
  markingColorHex: string | null;
  origin: QueenOrigin | null;
  breeder: string | null;
  breed: string | null;
  emergedOn: string | null;
  acquiredOn: string | null;
  introductionOutcome?: QueenIntroductionOutcome;
  notes: string | null;
};

export type UpdateQueenResponse = {
  id: string;
  markingColorHex: string | null;
  origin: QueenOrigin | null;
  breeder: string | null;
  breed: string | null;
  status: QueenStatus;
  emergedOn: string | null;
  acquiredOn: string | null;
  notes: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};
