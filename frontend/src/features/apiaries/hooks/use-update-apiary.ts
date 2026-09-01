import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateApiary,
} from '../api/update-apiary';

import type {
  UpdateApiaryRequest,
} from '../types/update-apiary';

export function useUpdateApiary(
  apiaryId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      request:
        UpdateApiaryRequest,
    ) =>
      updateApiary(
        apiaryId,
        request,
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey: [
              'apiaries',
            ],
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              'apiary',
              apiaryId,
            ],
          }),
      ]);
    },
  });
}