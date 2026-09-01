import type {
  ApiaryType,
  ApiaryStatus
} from './apiary';
import type {
  HiveEntranceOrientation
} from './apiary-stay';

export interface CreateApiaryRequest {
  identificationNumber:
    string | null;

  name:
    string | null;

  type:
    ApiaryType | null;

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

  type:
    ApiaryType | null;

  status:
    string | null;

  createdAtUtc:
    string;
}