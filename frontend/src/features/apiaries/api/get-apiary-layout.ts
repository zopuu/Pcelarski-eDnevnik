import { apiClient } from '@/shared/api/api-client';

import type { ApiaryLayoutResponse } from '../types/apiary-layout';

export function getApiaryLayout(apiaryId: string): Promise<ApiaryLayoutResponse> {
  return apiClient.get<ApiaryLayoutResponse>(`/api/apiaries/${apiaryId}/layout`, {
    authenticated: true,
  });
}
