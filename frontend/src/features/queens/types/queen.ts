export type QueenOrigin = 'purchased' | 'produced' | 'unknown';

export type QueenStatus = 'active' | 'dead' | 'killed' | 'missing' | 'sold' | 'removed';

export type QueenIntroductionMethod = 'placement' | 'caged' | 'direct' | 'unknown' | 'other';

export type QueenIntroductionOutcome = 'accepted' | 'killed' | 'missing' | 'unverified' | 'other';

export type CurrentQueen = {
  id: string;

  markingColorHex: string | null;

  origin: QueenOrigin | null;

  breeder: string | null;

  breed: string | null;

  status: QueenStatus;

  emergedOn: string | null;

  acquiredOn: string | null;

  notes: string | null;

  stayId: string;

  startedOn: string;

  introductionMethod: QueenIntroductionMethod | null;

  introductionOutcome: QueenIntroductionOutcome | null;

  stayNotes: string | null;
};
