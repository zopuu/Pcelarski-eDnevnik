import {
  useQuery,
} from '@tanstack/react-query';

import {
  getCurrentForageProfile,
} from '../api/get-current-forage-profile';
import {
  apiaryQueryKeys,
} from '../apiary-query-keys';

export function useCurrentForageProfile(
  apiaryId: string,
  year?: number,
) {
  return useQuery({
    queryKey:
      apiaryQueryKeys
        .forageProfiles(
          apiaryId,
          year,
        ),

    queryFn: () =>
      getCurrentForageProfile(
        apiaryId,
        year,
      ),
  });
}
