import { useQuery } from '@tanstack/react-query';

import { getPattyFeeding } from '../api/get-patty-feeding';
import { pattyFeedingQueryKeys } from '../patty-feeding-query-keys';

export function usePattyFeeding(hiveId: string, feedingId: string) {
  return useQuery({
    queryKey: pattyFeedingQueryKeys.detail(hiveId, feedingId),
    queryFn: () => getPattyFeeding(hiveId, feedingId),
    enabled: Boolean(hiveId && feedingId),
  });
}
