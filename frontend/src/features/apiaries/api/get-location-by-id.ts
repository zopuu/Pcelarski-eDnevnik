import { apiClient } from '@/shared/api/api-client';

import type { ApiaryLocation } from '../types/location';

export function getLocationById(locationId: string): Promise<ApiaryLocation> {
  return apiClient.get<ApiaryLocation>(`/api/locations/${locationId}`, {
    authenticated: true,
  });
}
