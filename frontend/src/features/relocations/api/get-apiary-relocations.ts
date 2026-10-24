import { apiClient } from '@/shared/api/api-client';

import type { ApiaryRelocationsPage } from '../types/relocation-history';

export function getApiaryRelocations(
  apiaryId: string,
  page: number,
): Promise<ApiaryRelocationsPage> {
  return apiClient.get<ApiaryRelocationsPage>(
    `/api/relocations/apiary/${apiaryId}?page=${page}&pageSize=20`,
    {
      authenticated: true,
    },
  );
}
