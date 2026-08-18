import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ApiaryListItem,
} from '../types/apiary-list-item';

export async function getApiaries() {
  return apiClient<ApiaryListItem[]>(
    '/api/apiaries',
    {
      authenticated: true,
    },
  );
}