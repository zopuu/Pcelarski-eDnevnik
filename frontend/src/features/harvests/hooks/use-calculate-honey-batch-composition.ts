import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calculateHoneyBatchComposition } from '../api/calculate-honey-batch-composition';
import { honeyBatchQueryKeys } from '../query-keys';

export function useCalculateHoneyBatchComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calculateHoneyBatchComposition,
    onSuccess: async (_, batchId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: honeyBatchQueryKeys.detail(batchId) }),
        queryClient.invalidateQueries({ queryKey: honeyBatchQueryKeys.lists() }),
      ]);
    },
  });
}
