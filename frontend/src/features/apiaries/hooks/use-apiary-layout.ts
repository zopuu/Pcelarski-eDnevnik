import { useQuery } from '@tanstack/react-query';

import { getApiaryLayout } from '../api/get-apiary-layout';
import { apiaryQueryKeys } from '../apiary-query-keys';

const apiaryIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useApiaryLayout(apiaryId: string) {
  return useQuery({
    queryKey: apiaryQueryKeys.layout(apiaryId),
    queryFn: () => getApiaryLayout(apiaryId),
    enabled: apiaryIdPattern.test(apiaryId) && apiaryId !== '00000000-0000-0000-0000-000000000000',
  });
}
