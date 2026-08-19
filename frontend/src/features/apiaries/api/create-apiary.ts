import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  CreateApiaryRequest,
  CreateApiaryResponse,
} from '../types/create-apiary';

export function createApiary(
  request: CreateApiaryRequest,
): Promise<CreateApiaryResponse> {
  return apiClient.post<CreateApiaryResponse>(
    '/api/apiaries',
    request,
    {
      authenticated: true,
    },
  );
}