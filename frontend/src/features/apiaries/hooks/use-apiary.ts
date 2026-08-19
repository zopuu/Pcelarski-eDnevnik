import {
  useQuery,
} from '@tanstack/react-query';

import {
  getApiaryById,
} from '../api/get-apiary-by-id';

export function useApiary(
  apiaryId: string,
) {
  return useQuery({
    queryKey: [
      'apiaries',
      'detail',
      apiaryId,
    ],

    queryFn: () =>
      getApiaryById(
        apiaryId,
      ),

    enabled:
      apiaryId.length > 0,
  });
}