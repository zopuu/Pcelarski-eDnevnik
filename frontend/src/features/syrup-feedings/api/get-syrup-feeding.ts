import { apiClient } from '@/shared/api/api-client';

import type { SyrupFeedingDetails } from '../types/syrup-feeding';

export function getSyrupFeeding(hiveId: string, feedingId: string): Promise<SyrupFeedingDetails> {
  return apiClient.get<SyrupFeedingDetails>(`/api/hives/${hiveId}/syrup-feedings/${feedingId}`, {
    authenticated: true,
  });
}
