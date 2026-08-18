import {
  useQuery,
} from '@tanstack/react-query';

import {
  getMyProfile,
} from '../api/get-my-profile';

export const beekeeperProfileKeys = {
  me: ['beekeeper-profile', 'me'] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey:
      beekeeperProfileKeys.me,

    queryFn:
      getMyProfile,
  });
}