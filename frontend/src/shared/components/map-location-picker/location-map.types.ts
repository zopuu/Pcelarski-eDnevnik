import type {
  GeographicCoordinates,
} from '@/shared/api/open-topo-data';

export type LocationMapProps = {
  value: GeographicCoordinates | null;

  onLocationPress:
  (coordinates: GeographicCoordinates) => void;
};
