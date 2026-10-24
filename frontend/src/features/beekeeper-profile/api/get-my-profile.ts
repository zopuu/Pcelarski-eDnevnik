import { apiClient } from '@/shared/api/api-client';

import type { BeekeeperProfile } from '../types/beekeeper-profile';

export function getMyProfile(): Promise<BeekeeperProfile> {
  return apiClient.get<BeekeeperProfile>('/api/profile/me', {
    authenticated: true,
  });
}
