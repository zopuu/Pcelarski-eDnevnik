import { useQuery } from '@tanstack/react-query';
import { getAvailableHarvestGroups } from '../api/get-available-harvest-groups';
import { harvestQueryKeys } from '../query-keys';

export function useAvailableHarvestGroups() {
  return useQuery({
    queryKey: harvestQueryKeys.availableGroups(),
    queryFn: getAvailableHarvestGroups,
  });
}
