import { apiClient } from '@/shared/api/api-client';

import type {
  CreateForageObservationRequest,
  CreateForageObservationResponse,
} from '../types/forage-observation';
import { appendImageToFormData } from '@/shared/api/image-upload';

export async function createForageObservation(
  request: CreateForageObservationRequest,
): Promise<CreateForageObservationResponse> {
  const formData = new FormData();

  formData.append('ObservedAt', request.observedAt);
  formData.append('ForageType', request.forageType);
  formData.append('Intensity', request.intensity.toString());
  formData.append('Latitude', request.latitude.toString());
  formData.append('Longitude', request.longitude.toString());

  if (request.notes) {
    formData.append('Notes', request.notes);
  }

  await appendImageToFormData(formData, 'Image', request.image);

  return apiClient.post<CreateForageObservationResponse, FormData>(
    '/api/forage-observations',
    formData,
    {
      authenticated: true,
    },
  );
}
