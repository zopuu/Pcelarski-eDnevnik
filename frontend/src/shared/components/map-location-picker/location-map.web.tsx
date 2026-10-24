import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

import { Text, View } from 'react-native';

import type { LocationMapProps } from './location-map.types';

const serbiaCenter = {
  lat: 44.0165,
  lng: 21.0059,
};

const webApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY;

export function LocationMap({ value, onLocationPress }: LocationMapProps) {
  if (!webApiKey) {
    return (
      <View
        className="
          h-72
          items-center
          justify-center
          rounded-2xl
          border
          border-border
          bg-surface
          px-6
        "
      >
        <Text
          className="
            text-center
            text-sm
            text-muted
          "
        >
          Dodajte Google Maps ključ za web da biste izabrali lokaciju.
        </Text>
      </View>
    );
  }

  const initialCenter = value
    ? {
        lat: value.latitude,
        lng: value.longitude,
      }
    : serbiaCenter;

  return (
    <View
      className="
        h-72
        overflow-hidden
        rounded-2xl
      "
    >
      <APIProvider apiKey={webApiKey}>
        <Map
          defaultCenter={initialCenter}
          defaultZoom={7}
          mapTypeId="hybrid"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          clickableIcons={false}
          gestureHandling="greedy"
          style={{
            width: '100%',
            height: '100%',
          }}
          onClick={(event) => {
            const coordinates = event.detail.latLng;

            if (!coordinates) {
              return;
            }

            onLocationPress({
              latitude: coordinates.lat,
              longitude: coordinates.lng,
            });
          }}
        >
          {value && (
            <Marker
              position={{
                lat: value.latitude,
                lng: value.longitude,
              }}
            />
          )}
        </Map>
      </APIProvider>
    </View>
  );
}
