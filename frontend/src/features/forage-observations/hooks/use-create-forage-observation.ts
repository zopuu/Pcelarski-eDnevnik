import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createForageObservation } from '../api/create-forage-observation';
import { forageObservationQueryKeys } from '../forage-observation-query-keys';
import type { CreateForageObservationRequest } from '../types/forage-observation';

export function useCreateForageObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateForageObservationRequest) => createForageObservation(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: forageObservationQueryKeys.all,
      });
    },
  });
}
