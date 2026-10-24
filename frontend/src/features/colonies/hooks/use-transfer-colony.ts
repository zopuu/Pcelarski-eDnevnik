import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hiveQueryKeys } from '@/features/hives/hive-query-keys';
import { queenQueryKeys } from '@/features/queens/queen-query-keys';

import { transferColony } from '../api/transfer-colony';
import { colonyQueryKeys } from '../colony-query-keys';
import type { TransferColonyRequest } from '../types/transfer-colony';

type TransferColonyVariables = {
  colonyId: string;
  request: TransferColonyRequest;
};

export function useTransferColony() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ colonyId, request }: TransferColonyVariables) =>
      transferColony(colonyId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: hiveQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: colonyQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queenQueryKeys.all,
        }),
      ]);
    },
  });
}
