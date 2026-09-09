import type {
  RecordHiveInspectionRequest,
  RecordHiveInspectionResponse,
} from "../types/hive-inspection";

import { apiClient } from "@/shared/api/api-client";

export function recordHiveInspection(
  hiveId: string,
  request: RecordHiveInspectionRequest,
): Promise<RecordHiveInspectionResponse> {
  return apiClient.post<RecordHiveInspectionResponse>(
    `/api/hives/${hiveId}/inspections`,
    request,
    {
      authenticated: true,
    },
  );
}
