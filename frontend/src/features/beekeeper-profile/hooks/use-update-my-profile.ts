import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateMyProfile,
} from '../api/update-my-profile';
import {
  beekeeperProfileKeys,
} from './use-my-profile';
import type {
  BeekeeperProfile,
} from '../types/beekeeper-profile';

export function useUpdateMyProfile() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,

    onSuccess: async (
      updatedProfile,
    ) => {
      const {
        email,
        ...profile
      } = updatedProfile;

      queryClient.setQueryData<BeekeeperProfile>(
        beekeeperProfileKeys.me,
        profile,
      );

      queryClient.setQueryData(
        ['auth', 'current-user'],
        (currentUser: {
          userId: string;
          email: string | null;
          username: string | null;
        } | undefined) => currentUser
          ? {
            ...currentUser,
            email,
            username: email,
          }
          : currentUser,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: beekeeperProfileKeys.me,
        }),

        queryClient.invalidateQueries({
          queryKey: ['auth', 'current-user'],
        }),
      ]);
    },
  });
}
