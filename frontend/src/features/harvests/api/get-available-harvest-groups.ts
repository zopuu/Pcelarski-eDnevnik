import { apiClient } from '@/shared/api/api-client';
import type { AvailableHarvestGroupsResponse } from '../types/harvest';

export function getAvailableHarvestGroups() {
  return apiClient.get<AvailableHarvestGroupsResponse>('/api/harvests/available-groups', {
    authenticated: true,
  });
}
