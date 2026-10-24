import { apiClient } from '@/shared/api/api-client';

export function deleteForageProfile(apiaryId: string, forageProfileId: string): Promise<void> {
  return apiClient.delete<void>(`/api/apiaries/${apiaryId}/forage-profiles/${forageProfileId}`, {
    authenticated: true,
  });
}
