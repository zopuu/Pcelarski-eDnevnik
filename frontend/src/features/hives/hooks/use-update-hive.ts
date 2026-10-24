import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateHive } from '../api/update-hive';
import { hiveQueryKeys } from '../hive-query-keys';
import type { UpdateHiveRequest } from '../types/update-hive';

type UpdateHiveVariables = {
  hiveId: string;
  request: UpdateHiveRequest;
};

export function useUpdateHive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hiveId, request }: UpdateHiveVariables) => updateHive(hiveId, request),

    onSuccess: async (response, variables) => {
      queryClient.setQueryData(hiveQueryKeys.detail(variables.hiveId), response);

      await queryClient.invalidateQueries({
        queryKey: ['hives'],
      });
    },
  });
}
