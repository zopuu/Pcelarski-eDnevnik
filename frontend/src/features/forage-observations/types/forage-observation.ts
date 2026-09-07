import type {
  ForageType,
} from '@/features/apiaries/types/forage-profile';
import type {
  ImageUpload,
} from '@/shared/api/image-upload';

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
  imageUrl: string | null;
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
  image: ImageUpload | null;
};

export type CreateForageObservationResponse = {
  id: string;
  forageProfileId: string | null;
  imageUrl: string | null;
};

export type UpdateForageObservationResponse = {
  id: string;
  forageProfileId: string | null;
  imageUrl: string | null;
  updatedAtUtc: string;
};
