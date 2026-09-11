import { apiClient } from '@/shared/api/api-client';
import type { HoneyBatchComposition } from '../types/harvest';

export function calculateHoneyBatchComposition(batchId: string) {
  return apiClient.post<HoneyBatchComposition>(
    `/api/honey-batches/${batchId}/composition/calculate`,
    undefined,
    { authenticated: true },
  );
}
