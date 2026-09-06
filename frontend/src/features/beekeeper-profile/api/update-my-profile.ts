import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from '../types/beekeeper-profile';

export function updateMyProfile(
  request: UpdateMyProfileRequest,
): Promise<UpdateMyProfileResponse> {
  return apiClient.put<
    UpdateMyProfileResponse,
    UpdateMyProfileRequest
  >(
    '/api/profile/me',
    request,
    {
      authenticated: true,
    },
  );
}
