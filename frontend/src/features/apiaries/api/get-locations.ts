import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ApiaryLocationListItem,
} from '../types/location';

export function getLocations(): Promise<
  ApiaryLocationListItem[]
> {
  return apiClient.get<
    ApiaryLocationListItem[]
  >(
    '/api/locations/used',
    {
      authenticated: true,
    },
  );
}
