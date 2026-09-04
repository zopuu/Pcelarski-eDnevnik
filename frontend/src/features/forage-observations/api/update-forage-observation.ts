import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  CreateForageObservationRequest,
  UpdateForageObservationResponse,
} from '../types/forage-observation';

export function updateForageObservation(
  observationId: string,
  request: CreateForageObservationRequest,
): Promise<UpdateForageObservationResponse> {
  return apiClient.put<
    UpdateForageObservationResponse,
    CreateForageObservationRequest
  >(
    `/api/forage-observations/${observationId}`,
    request,
    {
      authenticated: true,
    },
  );
}
