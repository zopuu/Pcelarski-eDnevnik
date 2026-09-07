import type {
  ApiaryStatus,
  ApiaryType
} from './apiary';

export type ApiaryDetails = {
  id: string;

  identificationNumber:
    string | null;

  name: string | null;

  imageUrl: string | null;

  type: ApiaryType | null;

  status: ApiaryStatus;

  createdAtUtc: string;

  updatedAtUtc:
    string | null;
};
