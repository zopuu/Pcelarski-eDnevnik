import type {
  ApiaryType,
  ApiaryStatus
} from './apiary';
import type {
  HiveEntranceOrientation
} from './apiary-stay';
import type {
  ApiaryImageUpload,
} from './apiary-image';

export interface CreateApiaryRequest {
  image?: ApiaryImageUpload | null;
  identificationNumber:
    string | null;

  name:
    string | null;

  type:
    ApiaryType;

  initialStay: {
    orientation:
      HiveEntranceOrientation | null;

    note:
      string | null;

    location: {
      name:
        string | null;

      latitude:
        number;

      longitude:
        number;

      altitudeMeters:
        number | null;

      cadastralParcelNumber:
        string | null;

      description:
        string | null;
    };
  };
}

export interface CreateApiaryResponse {
  id: string;

  identificationNumber:
    string | null;

  name:
    string | null;

  imageUrl:
    string | null;

  type:
    ApiaryType;

  status:
    string | null;

  createdAtUtc:
    string;
}
