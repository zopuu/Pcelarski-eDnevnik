import { apiClient } from '@/shared/api/api-client';

import type { CurrentUser } from '@/features/auth/types/current-user';

export function getCurrentUser(): Promise<CurrentUser> {
  return apiClient.get<CurrentUser>('/api/me', {
    authenticated: true,
  });
}
