import { apiClient } from '@/shared/api/api-client';

export type GeographicCoordinates = {
  latitude: number;
  longitude: number;
};

type ElevationResponse = {
  elevationMeters: number;
};

export async function getElevationMeters(
  coordinates: GeographicCoordinates,
  signal?: AbortSignal,
): Promise<number> {
  const query = new URLSearchParams({
    latitude: coordinates.latitude.toString(),
    longitude: coordinates.longitude.toString(),
  });

  const response = await apiClient.get<ElevationResponse>(
    `/api/apiaries/elevation?${query.toString()}`,
    {
      authenticated: true,
      signal,
    },
  );

  if (!Number.isFinite(response.elevationMeters)) {
    throw new Error('Elevation is not available for this location.');
  }

  return Math.round(response.elevationMeters);
}
