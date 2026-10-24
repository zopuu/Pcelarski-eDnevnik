import { apiClient } from '@/shared/api/api-client';

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export function changePassword(request: ChangePasswordRequest): Promise<null> {
  return apiClient.put<null, ChangePasswordRequest>('/api/account/password', request, {
    authenticated: true,
  });
}
