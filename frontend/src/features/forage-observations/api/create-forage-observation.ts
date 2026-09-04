import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  CreateForageObservationRequest,
  CreateForageObservationResponse,
} from '../types/forage-observation';

export function createForageObservation(
  request: CreateForageObservationRequest,
): Promise<CreateForageObservationResponse> {
  return apiClient.post<
    CreateForageObservationResponse,
    CreateForageObservationRequest
  >(
    '/api/forage-observations',
    request,
    {
      authenticated: true,
    },
  );
}
