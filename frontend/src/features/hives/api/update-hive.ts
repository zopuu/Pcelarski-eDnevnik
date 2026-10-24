import { apiClient } from '@/shared/api/api-client';

import type { UpdateHiveRequest, UpdateHiveResponse } from '../types/update-hive';

export function updateHive(
  hiveId: string,
  request: UpdateHiveRequest,
): Promise<UpdateHiveResponse> {
  return apiClient.put<UpdateHiveResponse>(`/api/hives/${hiveId}`, request, {
    authenticated: true,
  });
}
