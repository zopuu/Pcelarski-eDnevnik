import type { HiveEntranceOrientation } from './apiary-stay';
import type { ApiaryType, ApiaryStatus } from './apiary';
import type { UpdateLocationRequest } from './location';
import type { ApiaryImageUpload } from './apiary-image';
export type UpdateApiaryRequest = {
  image?: ApiaryImageUpload | null;
  identificationNumber: string | null;

  name: string;

  type: ApiaryType;
};

export type UpdateApiaryResponse = {
  id: string;

  identificationNumber: string | null;

  name: string;

  imageUrl: string | null;

  type: ApiaryType;

  status: ApiaryStatus | null;

  createdAtUtc: string;

  updatedAtUtc: string | null;
};

export type UpdateApiaryStayRequest = {
  orientation: HiveEntranceOrientation | null;
};

export type UpdateApiaryFormRequest = {
  apiaryId: string;
  stayId: string;
  locationId: string;

  apiary: UpdateApiaryRequest;

  stay: UpdateApiaryStayRequest;

  location: UpdateLocationRequest;
};
