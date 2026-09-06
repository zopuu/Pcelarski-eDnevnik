import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateQueen,
} from '../api/update-queen';
import {
  queenQueryKeys,
} from '../queen-query-keys';
import type {
  UpdateQueenRequest,
} from '../types/update-queen';

type UpdateQueenVariables = {
  queenId: string;
  colonyId: string;
  request: UpdateQueenRequest;
};

export function useUpdateQueen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      queenId,
      request,
    }: UpdateQueenVariables) => updateQueen(queenId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queenQueryKeys.all,
      });
    },
  });
}
