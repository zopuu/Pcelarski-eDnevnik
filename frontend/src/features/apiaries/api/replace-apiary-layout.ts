import { apiClient } from '@/shared/api/api-client';

import type {
  ReplaceApiaryLayoutRequest,
  ReplaceApiaryLayoutResponse,
} from '../types/apiary-layout';

export function replaceApiaryLayout(
  apiaryId: string,
  request: ReplaceApiaryLayoutRequest,
): Promise<ReplaceApiaryLayoutResponse> {
  return apiClient.put<ReplaceApiaryLayoutResponse, ReplaceApiaryLayoutRequest>(
    `/api/apiaries/${apiaryId}/layout`,
    request,
    { authenticated: true },
  );
}
