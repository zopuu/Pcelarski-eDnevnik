import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  CreateApiaryRequest,
  CreateApiaryResponse,
} from '../types/create-apiary';
import {
  appendApiaryImage,
} from './apiary-image-form-data';

export async function createApiary(
  request: CreateApiaryRequest,
): Promise<CreateApiaryResponse> {
  const formData = new FormData();
  const location = request.initialStay.location;

  if (request.identificationNumber) {
    formData.append('IdentificationNumber', request.identificationNumber);
  }

  formData.append('Name', request.name);

  if (request.type) {
    formData.append('Type', request.type);
  }

  if (request.initialStay.orientation) {
    formData.append('InitialStay.Orientation', request.initialStay.orientation);
  }

  if (request.initialStay.note) {
    formData.append('InitialStay.Note', request.initialStay.note);
  }

  if (location.name) {
    formData.append('InitialStay.Location.Name', location.name);
  }

  formData.append('InitialStay.Location.Latitude', location.latitude.toString());
  formData.append('InitialStay.Location.Longitude', location.longitude.toString());

  if (location.altitudeMeters !== null) {
    formData.append(
      'InitialStay.Location.AltitudeMeters',
      location.altitudeMeters.toString(),
    );
  }

  if (location.cadastralParcelNumber) {
    formData.append(
      'InitialStay.Location.CadastralParcelNumber',
      location.cadastralParcelNumber,
    );
  }

  if (location.description) {
    formData.append('InitialStay.Location.Description', location.description);
  }

  await appendApiaryImage(formData, request.image);

  return apiClient.post<CreateApiaryResponse, FormData>(
    '/api/apiaries',
    formData,
    {
      authenticated: true,
    },
  );
}
