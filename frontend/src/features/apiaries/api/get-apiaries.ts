import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ApiaryListItem,
} from '../types/apiary-list-item';

export function getApiaries():
  Promise<ApiaryListItem[]> {
  return apiClient.get<ApiaryListItem[]>(
    '/api/apiaries',
    {
      authenticated: true,
    },
  );
}