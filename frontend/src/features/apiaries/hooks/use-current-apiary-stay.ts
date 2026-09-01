import {
  useQuery,
} from '@tanstack/react-query';

import {
  getCurrentApiaryStay,
} from '@/features/apiaries/api/get-current-apiary-stay';

export function useCurrentApiaryStay(
  apiaryId: string,
) {
  return useQuery({
    queryKey: [
      'apiary-stays',
      apiaryId,
      'current',
    ],

    queryFn: () =>
      getCurrentApiaryStay(
        apiaryId,
      ),

    enabled:
      Boolean(apiaryId),
  });
}