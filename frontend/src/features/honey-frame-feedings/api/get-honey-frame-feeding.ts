import { apiClient } from '@/shared/api/api-client';

import type { HoneyFrameFeedingDetails } from '../types/honey-frame-feeding';

export function getHoneyFrameFeeding(
  hiveId: string,
  feedingId: string,
): Promise<HoneyFrameFeedingDetails> {
  return apiClient.get<HoneyFrameFeedingDetails>(
    `/api/hives/${hiveId}/honey-frame-feedings/${feedingId}`,
    { authenticated: true },
  );
}
