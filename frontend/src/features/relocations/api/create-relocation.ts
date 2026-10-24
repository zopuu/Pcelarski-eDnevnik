import { apiClient } from '@/shared/api/api-client';

import type { CreateRelocationRequest, CreateRelocationResponse } from '../types/create-relocation';

export function createRelocation(
  request: CreateRelocationRequest,
): Promise<CreateRelocationResponse> {
  return apiClient.post<CreateRelocationResponse, CreateRelocationRequest>(
    '/api/relocations',
    request,
    {
      authenticated: true,
    },
  );
}
