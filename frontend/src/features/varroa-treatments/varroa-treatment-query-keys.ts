export const varroaTreatmentQueryKeys = {
  all: ['varroa-treatments'] as const,

  byHive: (hiveId: string) => [...varroaTreatmentQueryKeys.all, 'hive', hiveId] as const,

  detail: (hiveId: string, treatmentId: string) =>
    [...varroaTreatmentQueryKeys.byHive(hiveId), 'detail', treatmentId] as const,
};
