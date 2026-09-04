import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteForageObservation,
} from '../api/delete-forage-observation';
import {
  forageObservationQueryKeys,
} from '../forage-observation-query-keys';

export function useDeleteForageObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteForageObservation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          forageObservationQueryKeys.all,
      });
    },
  });
}
