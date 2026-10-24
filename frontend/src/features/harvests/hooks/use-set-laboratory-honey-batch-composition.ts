import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setLaboratoryHoneyBatchComposition } from '../api/set-laboratory-honey-batch-composition';
import { honeyBatchQueryKeys } from '../query-keys';
import type { SetLaboratoryHoneyBatchCompositionRequest } from '../types/harvest';

export function useSetLaboratoryHoneyBatchComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      request,
    }: {
      batchId: string;
      request: SetLaboratoryHoneyBatchCompositionRequest;
    }) => setLaboratoryHoneyBatchComposition(batchId, request),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: honeyBatchQueryKeys.detail(variables.batchId) }),
        queryClient.invalidateQueries({ queryKey: honeyBatchQueryKeys.lists() }),
      ]);
    },
  });
}
