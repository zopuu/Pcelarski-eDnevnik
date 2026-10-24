import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setManualHoneyBatchComposition } from '../api/set-manual-honey-batch-composition';
import { honeyBatchQueryKeys } from '../query-keys';
import type { SetManualHoneyBatchCompositionRequest } from '../types/harvest';

export function useSetManualHoneyBatchComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      request,
    }: {
      batchId: string;
      request: SetManualHoneyBatchCompositionRequest;
    }) => setManualHoneyBatchComposition(batchId, request),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: honeyBatchQueryKeys.detail(variables.batchId) }),
        queryClient.invalidateQueries({ queryKey: honeyBatchQueryKeys.lists() }),
      ]);
    },
  });
}
