import { apiClient } from '@/shared/api/api-client';

import type { RecordPattyFeedingRequest, RecordPattyFeedingResponse } from '../types/patty-feeding';

export function recordPattyFeeding(
  request: RecordPattyFeedingRequest,
): Promise<RecordPattyFeedingResponse> {
  return apiClient.post<RecordPattyFeedingResponse>('/api/hive-actions/patty-feedings', request, {
    authenticated: true,
  });
}
