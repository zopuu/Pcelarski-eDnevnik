import { useQuery } from '@tanstack/react-query';

import { getHoneyFrameFeeding } from '../api/get-honey-frame-feeding';
import { honeyFrameFeedingQueryKeys } from '../honey-frame-feeding-query-keys';

export function useHoneyFrameFeeding(hiveId: string, feedingId: string) {
  return useQuery({
    queryKey: honeyFrameFeedingQueryKeys.detail(hiveId, feedingId),
    queryFn: () => getHoneyFrameFeeding(hiveId, feedingId),
    enabled: Boolean(hiveId && feedingId),
  });
}
