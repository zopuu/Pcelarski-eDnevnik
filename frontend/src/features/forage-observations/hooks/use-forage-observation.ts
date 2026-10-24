import { useQuery } from '@tanstack/react-query';

import { getForageObservationById } from '../api/get-forage-observation-by-id';
import { forageObservationQueryKeys } from '../forage-observation-query-keys';

export function useForageObservation(observationId?: string) {
  return useQuery({
    queryKey: forageObservationQueryKeys.detail(observationId ?? 'missing'),
    queryFn: () => getForageObservationById(observationId!),
    enabled: Boolean(observationId),
  });
}
