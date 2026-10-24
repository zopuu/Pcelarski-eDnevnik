import { apiClient } from '@/shared/api/api-client';

import type {
  RecordHiveMaintenanceRequest,
  RecordHiveMaintenanceResponse,
} from '../types/hive-maintenance';

export function recordHiveMaintenance(request: RecordHiveMaintenanceRequest) {
  return apiClient.post<RecordHiveMaintenanceResponse>(
    '/api/hive-actions/hive-maintenance',
    request,
    { authenticated: true },
  );
}
