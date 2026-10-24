import { apiClient } from '@/shared/api/api-client';

import type { CreateLocationRequest, CreateLocationResponse } from '../types/location';

export function createLocation(request: CreateLocationRequest): Promise<CreateLocationResponse> {
  return apiClient.post<CreateLocationResponse, CreateLocationRequest>('/api/locations', request, {
    authenticated: true,
  });
}
