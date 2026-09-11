import { apiClient } from '@/shared/api/api-client';
import type { HarvestsResponse } from '../types/harvest';

export function getHarvests(page: number, pageSize = 20) {
  return apiClient.get<HarvestsResponse>(
    `/api/harvests?page=${page}&pageSize=${pageSize}`,
    { authenticated: true },
  );
}
