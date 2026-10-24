import { useQuery } from '@tanstack/react-query';

import { getAvailableQueens } from '../api/get-available-queens';
import { queenQueryKeys } from '../queen-query-keys';

export function useAvailableQueens() {
  return useQuery({
    queryKey: [...queenQueryKeys.all, 'available'] as const,
    queryFn: getAvailableQueens,
  });
}
