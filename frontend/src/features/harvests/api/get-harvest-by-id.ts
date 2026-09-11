import { apiClient } from '@/shared/api/api-client';
import type { HarvestDetails } from '../types/harvest';

export function getHarvestById(harvestId: string) {
  return apiClient.get<HarvestDetails>(`/api/harvests/${harvestId}`, {
    authenticated: true,
  });
}
