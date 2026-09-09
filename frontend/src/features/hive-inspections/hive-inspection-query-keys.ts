export const hiveInspectionQueryKeys = {
  all: ["hive-inspections"] as const,

  byHive: (hiveId: string) =>
    [...hiveInspectionQueryKeys.all, "hive", hiveId] as const,

  history: (hiveId: string) =>
    [...hiveInspectionQueryKeys.byHive(hiveId), "history"] as const,

  detail: (hiveId: string, inspectionId: string) =>
    [
      ...hiveInspectionQueryKeys.byHive(hiveId),
      "detail",
      inspectionId,
    ] as const,
};
