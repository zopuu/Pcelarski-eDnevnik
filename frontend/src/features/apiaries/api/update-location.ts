import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ApiaryLocation,
  UpdateLocationRequest,
} from '../types/location';

export function updateLocation(
  locationId: string,
  request: UpdateLocationRequest,
): Promise<ApiaryLocation> {
  return apiClient.put<ApiaryLocation>(
    `/api/locations/${locationId}`,
    request,
    {
      authenticated: true,
    },
  );
}
