import type { ApiaryStatus, ApiaryType } from './apiary';

export type ApiaryDetails = {
  id: string;

  identificationNumber: string | null;

  name: string;

  imageUrl: string | null;

  type: ApiaryType;

  status: ApiaryStatus;

  createdAtUtc: string;

  updatedAtUtc: string | null;
};
