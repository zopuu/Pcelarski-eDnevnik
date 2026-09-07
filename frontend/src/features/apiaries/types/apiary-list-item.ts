import type {
  ApiaryStatus,
  ApiaryType,
} from './apiary';

export type ApiaryListItem = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  type: ApiaryType | null;
  status: ApiaryStatus | null;
};
