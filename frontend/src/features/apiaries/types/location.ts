export type ApiaryLocation = {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  cadastralParcelNumber: string | null;
  description: string | null;
};

export type ApiaryLocationListItem = {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  cadastralParcelNumber: string | null;
  description: string | null;
};

export type CreateLocationRequest = {
  name: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  cadastralParcelNumber: string | null;
  description: string | null;
};

export type CreateLocationResponse = ApiaryLocation & {
  createdAtUtc: string;
};

export type UpdateLocationRequest = {
  name: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  cadastralParcelNumber: string | null;
  description: string | null;
};
