import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ApiaryDetails,
} from '../types/apiary-details';

export function getApiaryById(
  apiaryId: string,
): Promise<ApiaryDetails> {
  return apiClient.get<
    ApiaryDetails
  >(
    `/api/apiaries/${apiaryId}`,
    {
      authenticated: true,
    },
  );
}