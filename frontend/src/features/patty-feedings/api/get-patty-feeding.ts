import { apiClient } from '@/shared/api/api-client';

import type { PattyFeedingDetails } from '../types/patty-feeding';

export function getPattyFeeding(
  hiveId: string,
  feedingId: string,
): Promise<PattyFeedingDetails> {
  return apiClient.get<PattyFeedingDetails>(
    `/api/hives/${hiveId}/patty-feedings/${feedingId}`,
    {
      authenticated: true,
    },
  );
}
