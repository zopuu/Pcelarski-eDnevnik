import type { QueenStatus } from './queen';
import type { QueenStayEndReason } from './change-queen';

export type EndQueenStayRequest = {
  endedOn: string;
  endReason: QueenStayEndReason;
  queenStatus: QueenStatus;
};

export type EndQueenStayResponse = {
  queenId: string;
  queenStayId: string;
  endedOn: string;
  endReason: QueenStayEndReason;
  queenStatus: QueenStatus;
};
