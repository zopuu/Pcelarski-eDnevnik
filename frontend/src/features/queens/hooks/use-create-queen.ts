import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createQueen,
} from '../api/create-queen';
import {
  queenQueryKeys,
} from '../queen-query-keys';
import type {
  CreateQueenRequest,
} from '../types/create-queen';

export function useCreateQueen(
  colonyId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateQueenRequest) =>
      createQueen(colonyId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queenQueryKeys.all,
      });
    },
  });
}
