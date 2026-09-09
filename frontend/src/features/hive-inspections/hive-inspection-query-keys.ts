export const hiveInspectionQueryKeys = {
  all: ["hive-inspections"] as const,

  byHive: (hiveId: string) =>
    [...hiveInspectionQueryKeys.all, "hive", hiveId] as const,
};
