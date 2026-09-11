import { useQuery } from '@tanstack/react-query';
import { getHarvestById } from '../api/get-harvest-by-id';
import { harvestQueryKeys } from '../query-keys';

export function useHarvest(harvestId?: string) {
  return useQuery({
    queryKey: harvestQueryKeys.detail(harvestId ?? 'missing'),
    queryFn: () => getHarvestById(harvestId!),
    enabled: Boolean(harvestId),
  });
}
