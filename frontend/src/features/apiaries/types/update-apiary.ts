import type {
  HiveEntranceOrientation,
} from './apiary-stay';
import type {
  ApiaryType,
  ApiaryStatus,
} from './apiary';
export type UpdateApiaryRequest = {
  identificationNumber:
    | string
    | null;

  name:
    | string
    | null;

  type:
    | ApiaryType
    | null;
};

export type UpdateApiaryResponse = {
  id: string;

  identificationNumber:
    | string
    | null;

  name:
    | string
    | null;

  type:
    | ApiaryType
    | null;

  status:
    | ApiaryStatus
    | null;

  createdAtUtc: string;

  updatedAtUtc:
    | string
    | null;
};

export type UpdateApiaryStayRequest = {
  orientation:
    | HiveEntranceOrientation
    | null;
};

export type UpdateApiaryFormRequest = {
  apiaryId: string;
  stayId: string;

  apiary:
    UpdateApiaryRequest;

  stay:
    UpdateApiaryStayRequest;
};