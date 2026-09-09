import { apiClient } from '@/shared/api/api-client';

import type { SyrupFeedingHiveOption } from '../types/syrup-feeding';

export function getSyrupFeedingOptions(
  apiaryId: string,
): Promise<SyrupFeedingHiveOption[]> {
  return apiClient.get<SyrupFeedingHiveOption[]>(
    `/api/apiaries/${apiaryId}/hives/feeding-options`,
    {
      authenticated: true,
    },
  );
}
