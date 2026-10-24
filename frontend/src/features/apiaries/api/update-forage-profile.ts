import { apiClient } from '@/shared/api/api-client';

import type { ForageProfile, UpdateForageProfileRequest } from '../types/forage-profile';

export function updateForageProfile(
  apiaryId: string,
  forageProfileId: string,
  request: UpdateForageProfileRequest,
): Promise<ForageProfile> {
  return apiClient.put<ForageProfile, UpdateForageProfileRequest>(
    `/api/apiaries/${apiaryId}/forage-profiles/${forageProfileId}`,
    request,
    {
      authenticated: true,
    },
  );
}
