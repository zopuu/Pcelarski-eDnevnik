import { apiClient } from '@/shared/api/api-client';
import type {
  CreateHarvestRequest,
  CreateHarvestResponse,
} from '../types/harvest';

export function createHarvest(request: CreateHarvestRequest) {
  return apiClient.post<CreateHarvestResponse, CreateHarvestRequest>(
    '/api/harvests',
    request,
    { authenticated: true },
  );
}
