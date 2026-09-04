import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ForageObservationsPage,
} from '../types/forage-observation';

export function getForageObservations(
  page: number,
  pageSize = 50,
): Promise<ForageObservationsPage> {
  return apiClient.get<ForageObservationsPage>(
    `/api/forage-observations?page=${page}&pageSize=${pageSize}`,
    {
      authenticated: true,
    },
  );
}

export function getForageObservationsByProfile(
  forageProfileId: string,
  page: number,
  pageSize = 50,
): Promise<ForageObservationsPage> {
  return apiClient.get<ForageObservationsPage>(
    `/api/forage-observations/profile/${forageProfileId}?page=${page}&pageSize=${pageSize}`,
    {
      authenticated: true,
    },
  );
}
