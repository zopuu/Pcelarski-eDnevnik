import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  CreateForageProfileRequest,
  ForageProfile,
} from '../types/forage-profile';

export function createForageProfile(
  apiaryId: string,
  request: CreateForageProfileRequest,
): Promise<ForageProfile> {
  return apiClient.post<
    ForageProfile,
    CreateForageProfileRequest
  >(
    `/api/apiaries/${apiaryId}/forage-profiles`,
    request,
    {
      authenticated: true,
    },
  );
}
