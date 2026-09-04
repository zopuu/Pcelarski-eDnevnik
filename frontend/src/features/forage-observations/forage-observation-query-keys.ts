export const forageObservationQueryKeys = {
  all: [
    'forage-observations',
  ] as const,

  byProfile: (
    forageProfileId: string,
  ) => [
    'forage-observations',
    'profile',
    forageProfileId,
  ] as const,
};
