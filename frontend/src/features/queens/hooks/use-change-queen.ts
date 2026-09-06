import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  changeQueen,
} from '../api/change-queen';
import {
  queenQueryKeys,
} from '../queen-query-keys';
import type {
  ChangeQueenRequest,
} from '../types/change-queen';

export function useChangeQueen(
  colonyId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ChangeQueenRequest) =>
      changeQueen(colonyId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queenQueryKeys.all,
      });
    },
  });
}
