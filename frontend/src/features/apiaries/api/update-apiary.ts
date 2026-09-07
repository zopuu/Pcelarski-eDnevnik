import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  UpdateApiaryRequest,
  UpdateApiaryResponse,
} from '../types/update-apiary';
import {
  appendApiaryImage,
} from './apiary-image-form-data';

export async function updateApiary(
  apiaryId: string,
  request: UpdateApiaryRequest,
): Promise<UpdateApiaryResponse> {
  const formData = new FormData();

  if (request.identificationNumber) {
    formData.append('IdentificationNumber', request.identificationNumber);
  }

  if (request.name) {
    formData.append('Name', request.name);
  }

  if (request.type) {
    formData.append('Type', request.type);
  }

  await appendApiaryImage(formData, request.image);

  return apiClient.put<UpdateApiaryResponse, FormData>(
    `/api/apiaries/${apiaryId}`,
    formData,
    {
      authenticated: true,
    },
  );
}
