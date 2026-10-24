import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createLocation } from '../api/create-location';
import { apiaryQueryKeys } from '../apiary-query-keys';

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiaryQueryKeys.locations(),
      });
    },
  });
}
