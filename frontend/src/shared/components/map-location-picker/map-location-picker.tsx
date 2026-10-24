import { useCallback, useEffect, useRef, useState } from 'react';

import { ActivityIndicator, Text, View } from 'react-native';

import { getElevationMeters } from '@/shared/api/open-topo-data';
import { colors } from '@/shared/theme/colors';

import { LocationMap } from './location-map';

import type { GeographicCoordinates } from '@/shared/api/open-topo-data';

const elevationRequestDelayMs = 1_100;

type ElevationLookupState = 'idle' | 'loading' | 'error';

export type MapLocationPickerProps = {
  value: GeographicCoordinates | null;

  onLocationChange: (coordinates: GeographicCoordinates) => void;

  onAltitudeChange: (altitudeMeters: number | null) => void;

  onElevationLoadingChange?: (isLoading: boolean) => void;

  error?: string;
};

export function MapLocationPicker({
  value,
  onLocationChange,
  onAltitudeChange,
  onElevationLoadingChange,
  error,
}: MapLocationPickerProps) {
  const [elevationLookupState, setElevationLookupState] = useState<ElevationLookupState>('idle');

  const requestIdRef = useRef(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelElevationLookup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  useEffect(() => cancelElevationLookup, [cancelElevationLookup]);

  const handleLocationPress = useCallback(
    (coordinates: GeographicCoordinates) => {
      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;
      cancelElevationLookup();

      onLocationChange(coordinates);
      onAltitudeChange(null);
      onElevationLoadingChange?.(true);
      setElevationLookupState('loading');

      timeoutRef.current = setTimeout(() => {
        const abortController = new AbortController();

        abortControllerRef.current = abortController;
        timeoutRef.current = null;

        void getElevationMeters(coordinates, abortController.signal)
          .then((altitudeMeters) => {
            if (requestId !== requestIdRef.current) {
              return;
            }

            onAltitudeChange(altitudeMeters);
            onElevationLoadingChange?.(false);
            setElevationLookupState('idle');
          })
          .catch(() => {
            if (abortController.signal.aborted || requestId !== requestIdRef.current) {
              return;
            }

            onElevationLoadingChange?.(false);
            setElevationLookupState('error');
          });
      }, elevationRequestDelayMs);
    },
    [cancelElevationLookup, onAltitudeChange, onElevationLoadingChange, onLocationChange],
  );

  return (
    <View className="mb-4">
      <Text
        className="
          mb-2
          text-sm
          font-semibold
          text-foreground
        "
      >
        Lokacija na mapi *
      </Text>

      <Text
        className="
          mb-3
          text-sm
          text-muted
        "
      >
        Dodirnite satelitski snimak da biste postavili pčelinjak.
      </Text>

      <LocationMap value={value} onLocationPress={handleLocationPress} />

      {elevationLookupState === 'loading' && (
        <View
          className="
            mt-3
            flex-row
            items-center
            gap-2
          "
        >
          <ActivityIndicator size="small" color={colors.primary} />

          <Text
            className="
              text-sm
              text-muted
            "
          >
            Preuzimanje nadmorske visine...
          </Text>
        </View>
      )}

      {elevationLookupState === 'error' && (
        <Text
          className="
            mt-3
            text-sm
            text-warning
          "
        >
          Nadmorska visina nije automatski preuzeta. Unesite je ručno.
        </Text>
      )}

      {error && (
        <Text
          className="
            mt-2
            text-sm
            text-error
          "
        >
          {error}
        </Text>
      )}
    </View>
  );
}
