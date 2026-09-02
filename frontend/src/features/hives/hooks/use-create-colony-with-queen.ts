import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  colonyQueryKeys,
} from '@/features/colonies/colony-query-keys';

import {
  queenQueryKeys,
} from '@/features/queens/queen-query-keys';

import {
  createColonyWithQueen,
} from '../api/create-colony-with-queen';

import type {
  CreateColonyWithQueenRequest,
} from '../types/create-colony-with-queen';

export function useCreateColonyWithQueen(
  hiveId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      request:
        CreateColonyWithQueenRequest,
    ) =>
      createColonyWithQueen(
        hiveId,
        request,
      ),

    onSuccess: async (
      response,
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              colonyQueryKeys
                .currentByHive(
                  hiveId,
                ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              queenQueryKeys
                .currentByColony(
                  response
                    .colonyId,
                ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              queenQueryKeys.all,
          }),
      ]);
    },
  });
}