import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  UpdateApiaryRequest,
  UpdateApiaryResponse,
} from '../types/update-apiary';

export async function updateApiary(
  apiaryId: string,
  request: UpdateApiaryRequest,
): Promise<UpdateApiaryResponse> {
  return apiClient.put<UpdateApiaryResponse>(
    `/api/apiaries/${apiaryId}`,
    request,
    {
      authenticated: true,
    },
  );
}