export type GeographicCoordinates = {
  latitude: number;
  longitude: number;
};

type OpenTopoDataResponse = {
  status?: unknown;
  results?: unknown;
};

const openTopoDataEndpoint =
  'https://api.opentopodata.org/v1/aster30m';

function readElevation(
  response: unknown,
): number | null {
  if (
    typeof response !== 'object' ||
    response === null
  ) {
    return null;
  }

  const payload =
    response as OpenTopoDataResponse;

  if (
    payload.status !== 'OK' ||
    !Array.isArray(payload.results) ||
    payload.results.length === 0
  ) {
    return null;
  }

  const result =
    payload.results[0];

  if (
    typeof result !== 'object' ||
    result === null ||
    !('elevation' in result) ||
    typeof result.elevation !== 'number' ||
    !Number.isFinite(result.elevation)
  ) {
    return null;
  }

  return Math.round(
    result.elevation,
  );
}

export async function getElevationMeters(
  coordinates: GeographicCoordinates,
  signal?: AbortSignal,
): Promise<number> {
  const locations =
    `${coordinates.latitude},${coordinates.longitude}`;

  const response = await fetch(
    `${openTopoDataEndpoint}?locations=${encodeURIComponent(locations)}`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      'Elevation lookup failed.',
    );
  }

  const elevation =
    readElevation(
      await response.json(),
    );

  if (elevation === null) {
    throw new Error(
      'Elevation is not available for this location.',
    );
  }

  return elevation;
}
