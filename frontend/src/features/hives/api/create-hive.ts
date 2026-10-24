import { apiClient } from '@/shared/api/api-client';

import type { CreateHiveRequest, CreateHiveResponse } from '../types/create-hive';

export function createHive(
  apiaryId: string,
  request: CreateHiveRequest,
): Promise<CreateHiveResponse> {
  return apiClient.post<CreateHiveResponse>(`/api/apiaries/${apiaryId}/hives`, request, {
    authenticated: true,
  });
}
