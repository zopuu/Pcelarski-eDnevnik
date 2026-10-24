import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHarvest } from '../api/create-harvest';
import { harvestQueryKeys, honeyBatchQueryKeys } from '../query-keys';
import { hiveSuperQueryKeys } from '@/features/hive-supers/hive-super-query-keys';
import { hiveQueryKeys } from '@/features/hives/hive-query-keys';
import type { CreateHarvestRequest } from '../types/harvest';

export function useCreateHarvest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateHarvestRequest) => createHarvest(request),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: harvestQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: honeyBatchQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: harvestQueryKeys.detail(response.harvestId) }),
        queryClient.invalidateQueries({
          queryKey: honeyBatchQueryKeys.detail(response.honeyBatchId),
        }),
        queryClient.invalidateQueries({ queryKey: hiveSuperQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: hiveQueryKeys.all }),
      ]);
    },
  });
}
