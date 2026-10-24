import { useQuery } from '@tanstack/react-query';

import { getCurrentApiaryStay } from '@/features/apiaries/api/get-current-apiary-stay';
import { apiaryQueryKeys } from '../apiary-query-keys';

export function useCurrentApiaryStay(apiaryId: string) {
  return useQuery({
    queryKey: apiaryQueryKeys.currentStay(apiaryId),

    queryFn: () => getCurrentApiaryStay(apiaryId),

    enabled: Boolean(apiaryId),
  });
}
