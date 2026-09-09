import { useQuery } from "@tanstack/react-query";

import { getHiveMaintenance } from "../api/get-hive-maintenance";
import { hiveMaintenanceQueryKeys } from "../hive-maintenance-query-keys";

export function useHiveMaintenance(hiveId: string, actionId: string) {
  return useQuery({
    queryKey: hiveMaintenanceQueryKeys.detail(hiveId, actionId),
    queryFn: () => getHiveMaintenance(hiveId, actionId),
    enabled: Boolean(hiveId && actionId),
  });
}
