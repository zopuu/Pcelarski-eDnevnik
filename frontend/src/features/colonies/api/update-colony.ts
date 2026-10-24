import { apiClient } from '@/shared/api/api-client';

import type { UpdateColonyRequest, UpdateColonyResponse } from '../types/update-colony';

export function updateColony(
  colonyId: string,
  request: UpdateColonyRequest,
): Promise<UpdateColonyResponse> {
  return apiClient.put<UpdateColonyResponse>(`/api/colonies/${colonyId}`, request, {
    authenticated: true,
  });
}
