import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  CreateForageObservationRequest,
  UpdateForageObservationResponse,
} from '../types/forage-observation';
import {
  appendImageToFormData,
} from '@/shared/api/image-upload';

export async function updateForageObservation(
  observationId: string,
  request: CreateForageObservationRequest,
): Promise<UpdateForageObservationResponse> {
  const formData = new FormData();

  formData.append('ObservedAt', request.observedAt);
  formData.append('ForageType', request.forageType);
  formData.append('Intensity', request.intensity.toString());
  formData.append('Latitude', request.latitude.toString());
  formData.append('Longitude', request.longitude.toString());

  if (request.notes) {
    formData.append('Notes', request.notes);
  }

  await appendImageToFormData(
    formData,
    'Image',
    request.image,
  );

  return apiClient.put<
    UpdateForageObservationResponse,
    FormData
  >(
    `/api/forage-observations/${observationId}`,
    formData,
    {
      authenticated: true,
    },
  );
}
