import type {
  ApiaryType,
} from './create-apiary';

export type ApiaryStatus =
  | 'active'
  | 'inactive';

export type ApiaryDetails = {
  id: string;

  identificationNumber:
    string | null;

  name: string | null;

  type: ApiaryType | null;

  status: ApiaryStatus;

  createdAtUtc: string;

  updatedAtUtc:
    string | null;
};