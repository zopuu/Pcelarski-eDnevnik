import { useInfiniteQuery } from "@tanstack/react-query";

import { getHiveInspectionHistory } from "../api/get-hive-inspection-history";
import { hiveInspectionQueryKeys } from "../hive-inspection-query-keys";

export function useHiveInspectionHistory(hiveId: string) {
  return useInfiniteQuery({
    queryKey: hiveInspectionQueryKeys.history(hiveId),
    queryFn: ({ pageParam }) => getHiveInspectionHistory(hiveId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: Boolean(hiveId),
  });
}
