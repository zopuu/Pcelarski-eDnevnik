import {
  useQuery,
} from '@tanstack/react-query';

import {
  getTransferDestinations,
} from '../api/get-transfer-destinations';
import {
  colonyQueryKeys,
} from '../colony-query-keys';

export function useTransferDestinations(
  colonyId: string,
) {
  return useQuery({
    queryKey: colonyQueryKeys.transferDestinations(colonyId),
    queryFn: () => getTransferDestinations(colonyId),
    enabled: colonyId.length > 0,
  });
}
