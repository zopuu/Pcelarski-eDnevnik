import { useQuery } from "@tanstack/react-query";

import { getHiveInspection } from "../api/get-hive-inspection";
import { hiveInspectionQueryKeys } from "../hive-inspection-query-keys";

export function useHiveInspection(hiveId: string, inspectionId: string) {
  return useQuery({
    queryKey: hiveInspectionQueryKeys.detail(hiveId, inspectionId),
    queryFn: () => getHiveInspection(hiveId, inspectionId),
    enabled: Boolean(hiveId && inspectionId),
  });
}
