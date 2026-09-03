import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createForageProfile,
} from '../api/create-forage-profile';
import {
  apiaryQueryKeys,
} from '../apiary-query-keys';
import type {
  CreateForageProfileRequest,
} from '../types/forage-profile';

export function useCreateForageProfile(
  apiaryId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      request: CreateForageProfileRequest,
    ) =>
      createForageProfile(
        apiaryId,
        request,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'forage-profiles',
          apiaryId,
        ],
      });
    },
  });
}
