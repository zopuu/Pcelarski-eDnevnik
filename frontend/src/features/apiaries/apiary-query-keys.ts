export const apiaryQueryKeys = {
  all: [
    'apiaries',
  ] as const,

  detail: (
    apiaryId: string,
  ) =>
    [
      'apiary',
      apiaryId,
    ] as const,

  currentStay: (
    apiaryId: string,
  ) =>
    [
      'apiary-stays',
      apiaryId,
      'current',
    ] as const,
};