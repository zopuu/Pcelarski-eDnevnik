import type {
  QueenIntroductionMethod,
  QueenIntroductionOutcome,
} from './queen';
import type {
  ColonyOrigin,
} from '@/features/colonies/types/colony';

export type QueenStayHive = {
  id: string;
  label: string;
  colorHex: string | null;
};

export type QueenStayHistoryItem = {
  id: string;
  startedOn: string;
  endedOn: string | null;
  colonyOrigin: ColonyOrigin | null;
  colonyFormedOn: string | null;
  introductionMethod: QueenIntroductionMethod | null;
  introductionOutcome: QueenIntroductionOutcome | null;
  notes: string | null;
  hives: QueenStayHive[];
};

export type QueenStayHistoryPage = {
  items: QueenStayHistoryItem[];
  page: number;
  hasNextPage: boolean;
};
