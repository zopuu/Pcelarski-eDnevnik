import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateColony } from '../api/update-colony';
import { colonyQueryKeys } from '../colony-query-keys';
import type { UpdateColonyRequest } from '../types/update-colony';

type UpdateColonyVariables = {
  colonyId: string;
  hiveId: string;
  request: UpdateColonyRequest;
};

export function useUpdateColony() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ colonyId, request }: UpdateColonyVariables) => updateColony(colonyId, request),

    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: colonyQueryKeys.currentByHive(variables.hiveId),
      });
    },
  });
}
