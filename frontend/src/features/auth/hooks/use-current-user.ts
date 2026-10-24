import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '@/features/auth/api/get-current-user';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],

    queryFn: getCurrentUser,
  });
}
