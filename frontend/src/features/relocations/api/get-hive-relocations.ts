import { apiClient } from '@/shared/api/api-client';

import type { ApiaryRelocationsPage } from '../types/relocation-history';

export function getHiveRelocations(hiveId: string, page: number): Promise<ApiaryRelocationsPage> {
  return apiClient.get<ApiaryRelocationsPage>(
    `/api/relocations/hive/${hiveId}?page=${page}&pageSize=20`,
    { authenticated: true },
  );
}
