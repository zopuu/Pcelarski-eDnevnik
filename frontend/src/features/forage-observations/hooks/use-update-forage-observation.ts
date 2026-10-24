import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateForageObservation } from '../api/update-forage-observation';
import { forageObservationQueryKeys } from '../forage-observation-query-keys';
import type { CreateForageObservationRequest } from '../types/forage-observation';

export function useUpdateForageObservation(observationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateForageObservationRequest) =>
      updateForageObservation(observationId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: forageObservationQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: forageObservationQueryKeys.detail(observationId),
      });
    },
  });
}
