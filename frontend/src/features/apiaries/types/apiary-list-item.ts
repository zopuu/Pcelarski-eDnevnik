import type { ApiaryStatus, ApiaryType } from './apiary';

export type ApiaryListItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  type: ApiaryType;
  status: ApiaryStatus | null;
};
