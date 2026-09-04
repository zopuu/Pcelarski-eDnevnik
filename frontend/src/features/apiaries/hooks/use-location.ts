import {
  useQuery,
} from '@tanstack/react-query';

import {
  getLocationById,
} from '../api/get-location-by-id';

export function useLocation(
  locationId: string,
) {
  return useQuery({
    queryKey: [
      'locations',
      'detail',
      locationId,
    ],

    queryFn: () =>
      getLocationById(locationId),

    enabled:
      locationId.length > 0,
  });
}
