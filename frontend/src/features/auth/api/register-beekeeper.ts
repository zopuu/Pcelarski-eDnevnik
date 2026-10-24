import { apiClient } from '@/shared/api/api-client';

import type {
  RegisterBeekeeperRequest,
  RegisterBeekeeperResponse,
} from '@/features/auth/types/register';

export function registerBeekeeper(
  request: RegisterBeekeeperRequest,
): Promise<RegisterBeekeeperResponse> {
  return apiClient.post<RegisterBeekeeperResponse, RegisterBeekeeperRequest>(
    '/api/auth/register',
    request,
  );
}
