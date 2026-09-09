import { apiClient } from "@/shared/api/api-client";

import type { HiveMaintenanceDetails } from "../types/hive-maintenance";

export function getHiveMaintenance(hiveId: string, actionId: string) {
  return apiClient.get<HiveMaintenanceDetails>(
    `/api/hives/${hiveId}/maintenance/${actionId}`,
    { authenticated: true },
  );
}
