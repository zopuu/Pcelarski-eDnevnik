import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ForageObservation,
} from '../types/forage-observation';

export function getForageObservationById(
  observationId: string,
): Promise<ForageObservation> {
  return apiClient.get<ForageObservation>(
    `/api/forage-observations/${observationId}`,
    {
      authenticated: true,
    },
  );
}
