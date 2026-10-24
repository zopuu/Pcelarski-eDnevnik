import { apiClient } from '@/shared/api/api-client';

type DeactivateApiaryResponse = {
  id: string;
  status: 'inactive';
  deactivatedAtUtc: string;
};

export function deactivateApiary(apiaryId: string): Promise<DeactivateApiaryResponse> {
  return apiClient.post<DeactivateApiaryResponse, undefined>(
    `/api/apiaries/${apiaryId}/deactivate`,
    undefined,
    {
      authenticated: true,
    },
  );
}
