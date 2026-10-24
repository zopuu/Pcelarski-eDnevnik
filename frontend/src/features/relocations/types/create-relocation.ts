import type { HiveEntranceOrientation } from '@/features/apiaries/types/apiary-stay';

export type RelocationKind = 'wholeApiary' | 'selectedHives';

export type RelocationTransportMethod = 'trailer' | 'truck' | 'van' | 'other';

export type CreateRelocationRequest = {
  kind: RelocationKind;
  sourceApiaryId: string;
  destinationLocationId?: string;
  destinationApiaryId?: string;
  destinationOrientation?: HiveEntranceOrientation;
  destinationStayNote?: string;
  hiveIds?: string[];
  occurredAtUtc: string;
  costAmount?: number;
  currencyCode?: string;
  transportMethod: RelocationTransportMethod;
  distanceKm?: number;
  notes?: string;
};

export type CreateRelocationResponse = {
  id: string;
};
