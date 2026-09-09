import { apiClient } from '@/shared/api/api-client';

import type {
  AddHiveSupersRequest,
  AddHiveSupersResponse,
} from '../types/hive-super';

export function addHiveSupers(
  hiveId: string,
  request: AddHiveSupersRequest,
): Promise<AddHiveSupersResponse> {
  return apiClient.post<AddHiveSupersResponse, AddHiveSupersRequest>(
    `/api/hives/${hiveId}/supers`,
    request,
    { authenticated: true },
  );
}
