import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hiveActionQueryKeys } from '@/features/hive-actions/hive-action-query-keys';
import { hiveQueryKeys } from '@/features/hives/hive-query-keys';

import { addHiveSupers } from '../api/add-hive-supers';
import { removeHiveSupers } from '../api/remove-hive-supers';
import { hiveSuperQueryKeys } from '../hive-super-query-keys';
import type {
  AddHiveSupersRequest,
  RemoveHiveSupersRequest,
} from '../types/hive-super';

async function invalidateHiveSuperState(
  queryClient: ReturnType<typeof useQueryClient>,
  hiveId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: hiveSuperQueryKeys.current(hiveId),
    }),
    queryClient.invalidateQueries({
      queryKey: hiveQueryKeys.detail(hiveId),
    }),
    queryClient.invalidateQueries({
      queryKey: hiveActionQueryKeys.history(hiveId),
    }),
  ]);
}

export function useAddHiveSupers(hiveId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddHiveSupersRequest) => addHiveSupers(hiveId, request),
    onSuccess: () => invalidateHiveSuperState(queryClient, hiveId),
  });
}

export function useRemoveHiveSupers(hiveId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RemoveHiveSupersRequest) =>
      removeHiveSupers(hiveId, request),
    onSuccess: () => invalidateHiveSuperState(queryClient, hiveId),
  });
}
