import { apiClient } from '@/shared/api/api-client';

import type { RemoveHiveSupersRequest, RemoveHiveSupersResponse } from '../types/hive-super';

export function removeHiveSupers(
  hiveId: string,
  request: RemoveHiveSupersRequest,
): Promise<RemoveHiveSupersResponse> {
  return apiClient.post<RemoveHiveSupersResponse, RemoveHiveSupersRequest>(
    `/api/hives/${hiveId}/supers/remove`,
    request,
    { authenticated: true },
  );
}
