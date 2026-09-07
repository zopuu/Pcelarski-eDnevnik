import type {
  HiveEntranceOrientation,
} from './apiary-stay';
import type {
  ApiaryType,
  ApiaryStatus,
} from './apiary';
import type {
  UpdateLocationRequest,
} from './location';
import type {
  ApiaryImageUpload,
} from './apiary-image';
export type UpdateApiaryRequest = {
  image?: ApiaryImageUpload | null;
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

  imageUrl:
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
  locationId: string;

  apiary:
    UpdateApiaryRequest;

  stay:
    UpdateApiaryStayRequest;

  location:
    UpdateLocationRequest;
};
