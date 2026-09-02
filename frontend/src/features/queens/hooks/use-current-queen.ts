import {
  useQuery,
} from '@tanstack/react-query';

import {
  getCurrentQueenByColony,
} from '../api/get-current-queen-by-colony';

import {
  queenQueryKeys,
} from '../queen-query-keys';

export function useCurrentQueen(
  colonyId:
    | string
    | null,
) {
  return useQuery({
    queryKey:
      queenQueryKeys
        .currentByColony(
          colonyId ??
            'none',
        ),

    queryFn: () =>
      getCurrentQueenByColony(
        colonyId!,
      ),

    enabled:
      colonyId !== null,
  });
}