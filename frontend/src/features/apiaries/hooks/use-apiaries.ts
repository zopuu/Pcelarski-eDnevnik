import {
  useQuery,
} from '@tanstack/react-query';

import {
  getApiaries,
} from '../api/get-apiaries';

export const apiaryKeys = {
  all: ['apiaries'] as const,
};

export function useApiaries() {
  return useQuery({
    queryKey: apiaryKeys.all,
    queryFn: getApiaries,
  });
}