export type ColonyOrigin =
  | 'swarm'
  | 'purchased'
  | 'split';

export type ColonyStatus =
  | 'active'
  | 'dead'
  | 'split'
  | 'merged'
  | 'sold'
  | 'lost';

export type CurrentColony = {
  id: string;

  origin:
    | ColonyOrigin
    | null;

  status:
    ColonyStatus;

  formedOn:
    | string
    | null;

  notes:
    | string
    | null;

  stayId: string;

  startedOn: string;

  stayNotes:
    | string
    | null;
};