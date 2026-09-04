import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateForageProfile } from "../api/update-forage-profile";
import { apiaryQueryKeys } from "../apiary-query-keys";
import type { UpdateForageProfileRequest } from "../types/forage-profile";

type UpdateForageProfileVariables = {
  forageProfileId: string;

  request: UpdateForageProfileRequest;
};

export function useUpdateForageProfile(apiaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ forageProfileId, request }: UpdateForageProfileVariables) =>
      updateForageProfile(apiaryId, forageProfileId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["forage-profiles", apiaryId],
      });
    },
  });
}
