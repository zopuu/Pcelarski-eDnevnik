import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ForageProfile,
} from '../types/forage-profile';

export function getCurrentForageProfile(
  apiaryId: string,
  year?: number,
): Promise<ForageProfile> {
  const yearQuery =
    year === undefined
      ? ''
      : `?year=${year}`;

  return apiClient.get<ForageProfile>(
    `/api/apiaries/${apiaryId}/forage-profiles${yearQuery}`,
    {
      authenticated: true,
    },
  );
}
