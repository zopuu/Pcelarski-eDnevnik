import { apiClient } from '@/shared/api/api-client';

import type {
  RecordSyrupFeedingRequest,
  RecordSyrupFeedingResponse,
} from '../types/syrup-feeding';

export function recordSyrupFeeding(
  request: RecordSyrupFeedingRequest,
): Promise<RecordSyrupFeedingResponse> {
  return apiClient.post<RecordSyrupFeedingResponse>(
    '/api/hive-actions/syrup-feedings',
    request,
    {
      authenticated: true,
    },
  );
}
