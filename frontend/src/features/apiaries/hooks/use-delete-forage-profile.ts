import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteForageProfile } from '../api/delete-forage-profile';

export function useDeleteForageProfile(apiaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (forageProfileId: string) => deleteForageProfile(apiaryId, forageProfileId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['forage-profiles', apiaryId],
      });
    },
  });
}
