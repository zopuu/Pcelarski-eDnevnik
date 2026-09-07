import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deactivateApiary,
} from '../api/deactivate-apiary';
import {
  apiaryQueryKeys,
} from '../apiary-query-keys';

export function useDeactivateApiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateApiary,

    onSuccess: async (_data, apiaryId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: apiaryQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: apiaryQueryKeys.detail(apiaryId),
        }),
        queryClient.invalidateQueries({
          queryKey: apiaryQueryKeys.currentStay(apiaryId),
        }),
        queryClient.invalidateQueries({
          queryKey: apiaryQueryKeys.stayHistory(apiaryId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['hives'],
        }),
      ]);
    },
  });
}
