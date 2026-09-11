import { apiClient } from '@/shared/api/api-client';
import type { HoneyBatchDetails } from '../types/harvest';

export function getHoneyBatchById(batchId: string) {
  return apiClient.get<HoneyBatchDetails>(`/api/honey-batches/${batchId}`, {
    authenticated: true,
  });
}
