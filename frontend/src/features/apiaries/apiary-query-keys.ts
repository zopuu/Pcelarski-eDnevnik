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

  stayHistory: (
    apiaryId: string,
  ) =>
    [
      'apiary-stays',
      apiaryId,
      'history',
    ] as const,

  locations: () =>
    [
      'locations',
    ] as const,

  forageProfiles: (
    apiaryId: string,
    year?: number,
  ) =>
    [
      'forage-profiles',
      apiaryId,
      year ?? 'latest',
    ] as const,
};
