import { useQuery } from '@tanstack/react-query';

import { getSyrupFeeding } from '../api/get-syrup-feeding';
import { syrupFeedingQueryKeys } from '../syrup-feeding-query-keys';

export function useSyrupFeeding(
  hiveId: string,
  feedingId: string,
) {
  return useQuery({
    queryKey: syrupFeedingQueryKeys.detail(hiveId, feedingId),
    queryFn: () => getSyrupFeeding(hiveId, feedingId),
    enabled: Boolean(hiveId && feedingId),
  });
}
