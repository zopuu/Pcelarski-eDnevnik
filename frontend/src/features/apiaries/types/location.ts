export type ApiaryLocation = {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  cadastralParcelNumber: string | null;
  description: string | null;
};

export type UpdateLocationRequest = {
  name: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  cadastralParcelNumber: string | null;
  description: string | null;
};
