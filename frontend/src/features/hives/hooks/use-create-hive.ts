import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createHive,
} from '../api/create-hive';

import {
  hiveQueryKeys,
} from '../api/hive-query-keys';

import type {
  CreateHiveRequest,
} from '../types/create-hive';

export function useCreateHive(
  apiaryId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      request:
        CreateHiveRequest,
    ) =>
      createHive(
        apiaryId,
        request,
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            hiveQueryKeys
              .byApiary(
                apiaryId,
              ),
        });
    },
  });
}