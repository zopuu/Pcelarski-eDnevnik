import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  apiaryQueryKeys,
} from '@/features/apiaries/apiary-query-keys';
import {
  hiveQueryKeys,
} from '@/features/hives/hive-query-keys';

import {
  createRelocation,
} from '../api/create-relocation';

export function useCreateRelocation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createRelocation,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            apiaryQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey:
            hiveQueryKeys.all,
        }),
      ]);
    },
  });
}
