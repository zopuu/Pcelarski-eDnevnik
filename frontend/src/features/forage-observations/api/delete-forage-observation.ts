import {
  apiClient,
} from '@/shared/api/api-client';

export function deleteForageObservation(
  observationId: string,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/forage-observations/${observationId}`,
    {
      authenticated: true,
    },
  );
}
