import { useMutation, useQueryClient } from '@tanstack/react-query';
import { finalizeHoneyBatch } from '../api/finalize-honey-batch';
import { honeyBatchQueryKeys } from '../query-keys';

export function useFinalizeHoneyBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => finalizeHoneyBatch(batchId),
    onSuccess: async (_, batchId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: honeyBatchQueryKeys.detail(batchId),
        }),
        queryClient.invalidateQueries({
          queryKey: honeyBatchQueryKeys.lists(),
        }),
      ]);
    },
  });
}
