import { apiClient } from '@/shared/api/api-client';

import type {
  RecordHoneyFrameFeedingRequest,
  RecordHoneyFrameFeedingResponse,
} from '../types/honey-frame-feeding';

export function recordHoneyFrameFeeding(
  request: RecordHoneyFrameFeedingRequest,
): Promise<RecordHoneyFrameFeedingResponse> {
  return apiClient.post<RecordHoneyFrameFeedingResponse>(
    '/api/hive-actions/honey-frame-feedings',
    request,
    { authenticated: true },
  );
}
