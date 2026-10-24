import type { HiveEntranceOrientation } from '@/features/apiaries/types/apiary-stay';

import type { RelocationKind, RelocationTransportMethod } from './create-relocation';

type RelocationPlace = {
  apiary: {
    id: string;
    identificationNumber: string;
    name: string;
  };
  stay: {
    id: string;
    startedAtUtc: string;
    endedAtUtc: string | null;
    orientation: HiveEntranceOrientation | null;
    note: string | null;
  };
  location: {
    id: string;
    name: string | null;
    description: string | null;
    altitudeMeters: number | null;
    cadastralParcelNumber: string | null;
    latitude: number;
    longitude: number;
  };
};

export type RelocationDetails = {
  id: string;
  kind: RelocationKind;
  occurredAtUtc: string;
  transportMethod: RelocationTransportMethod;
  distanceKm: number | null;
  costAmount: number | null;
  currencyCode: string | null;
  notes: string | null;
  hiveCount: number | null;
  origin: RelocationPlace;
  destination: RelocationPlace;
};
