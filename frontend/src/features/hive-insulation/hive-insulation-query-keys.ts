export const hiveInsulationQueryKeys = {
  all: ['hive-insulation'] as const,

  current: (hiveId: string) =>
    [...hiveInsulationQueryKeys.all, 'current', hiveId] as const,

  detail: (hiveId: string, actionId: string) =>
    [...hiveInsulationQueryKeys.all, 'detail', hiveId, actionId] as const,
};
