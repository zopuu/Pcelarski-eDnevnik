import { useQuery } from '@tanstack/react-query';

import { getSyrupFeedingOptions } from '../api/get-syrup-feeding-options';
import { syrupFeedingQueryKeys } from '../syrup-feeding-query-keys';

export function useSyrupFeedingOptions(apiaryId: string) {
  return useQuery({
    queryKey: syrupFeedingQueryKeys.feedingOptions(apiaryId),
    queryFn: () => getSyrupFeedingOptions(apiaryId),
    enabled: apiaryId.length > 0,
  });
}
