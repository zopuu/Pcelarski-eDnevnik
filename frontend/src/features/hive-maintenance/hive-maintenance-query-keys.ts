export const hiveMaintenanceQueryKeys = {
  all: ['hive-maintenance'] as const,
  detail: (hiveId: string, actionId: string) =>
    [...hiveMaintenanceQueryKeys.all, 'detail', hiveId, actionId] as const,
};
