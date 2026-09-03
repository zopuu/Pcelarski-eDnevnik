import type {
  ColonyOrigin,
  ColonyStatus,
} from './colony';

export type UpdateColonyRequest = {
  origin:
    | ColonyOrigin
    | null;

  formedOn:
    | string
    | null;

  notes:
    | string
    | null;
};

export type UpdateColonyResponse = {
  id: string;

  origin:
    | ColonyOrigin
    | null;

  status: ColonyStatus;

  formedOn:
    | string
    | null;

  notes:
    | string
    | null;
};
