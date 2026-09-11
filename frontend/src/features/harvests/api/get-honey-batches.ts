import { apiClient } from '@/shared/api/api-client';
import type { HoneyBatchesResponse } from '../types/harvest';

export function getHoneyBatches(page: number, pageSize = 20) {
  return apiClient.get<HoneyBatchesResponse>(
    `/api/honey-batches?page=${page}&pageSize=${pageSize}`,
    { authenticated: true },
  );
}
