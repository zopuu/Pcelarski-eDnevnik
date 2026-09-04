import type {
  ForageType,
} from '@/features/apiaries/types/forage-profile';

export type ForageObservation = {
  id: string;
  observedAt: string;
  forageType: ForageType;
  intensity: number;
  notes: string | null;
  latitude: number;
  longitude: number;
  forageProfileId: string | null;
  forageProfileName: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type ForageObservationsPage = {
  items: ForageObservation[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type CreateForageObservationRequest = {
  observedAt: string;
  forageType: ForageType;
  intensity: number;
  notes: string | null;
  latitude: number;
  longitude: number;
};

export type CreateForageObservationResponse = {
  id: string;
  forageProfileId: string | null;
};
