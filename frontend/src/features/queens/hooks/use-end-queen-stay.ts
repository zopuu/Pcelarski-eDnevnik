import { useMutation, useQueryClient } from '@tanstack/react-query';

import { endQueenStay } from '../api/end-queen-stay';
import { queenQueryKeys } from '../queen-query-keys';
import type { EndQueenStayRequest } from '../types/end-queen-stay';

export function useEndQueenStay(colonyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EndQueenStayRequest) => endQueenStay(colonyId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queenQueryKeys.all,
      });
    },
  });
}
