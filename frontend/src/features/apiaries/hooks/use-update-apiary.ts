import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateApiary,
} from '@/features/apiaries/api/update-apiary';

import {
  updateApiaryStay,
} from '@/features/apiaries/api/update-apiary-stay';

import type {
  UpdateApiaryFormRequest,
} from '@/features/apiaries/types/update-apiary';

export function useUpdateApiary() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      request:
        UpdateApiaryFormRequest,
    ) => {
      const apiary =
        await updateApiary(
          request.apiaryId,
          request.apiary,
        );

      const stay =
        await updateApiaryStay(
          request.apiaryId,
          request.stayId,
          request.stay,
        );

      return {
        apiary,
        stay,
      };
    },

    onSuccess: async (
      _data,
      variables,
    ) => {
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
              variables.apiaryId,
            ],
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              'apiary-stays',
              variables.apiaryId,
              'current',
            ],
          }),
      ]);
    },
  });
}