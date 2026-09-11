import { apiClient } from '@/shared/api/api-client';
import type { FinalizeHoneyBatchResponse } from '../types/harvest';

export function finalizeHoneyBatch(batchId: string) {
  return apiClient.post<FinalizeHoneyBatchResponse>(
    `/api/honey-batches/${batchId}/finalize`,
    undefined,
    { authenticated: true },
  );
}
