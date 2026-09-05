import {
  useQuery,
} from '@tanstack/react-query';

import {
  getLocations,
} from '../api/get-locations';
import {
  apiaryQueryKeys,
} from '../apiary-query-keys';

export function useLocations() {
  return useQuery({
    queryKey:
      apiaryQueryKeys.locations(),

    queryFn: getLocations,
  });
}
