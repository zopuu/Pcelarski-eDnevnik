import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import type { Region } from 'react-native-maps';

import type { LocationMapProps } from './location-map.types';

const serbiaRegion: Region = {
  latitude: 44.0165,
  longitude: 21.0059,
  latitudeDelta: 4.4,
  longitudeDelta: 4.4,
};

function getInitialRegion(value: LocationMapProps['value']): Region {
  if (!value) {
    return serbiaRegion;
  }

  return {
    latitude: value.latitude,
    longitude: value.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };
}

export function LocationMap({ value, onLocationPress }: LocationMapProps) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      initialRegion={getInitialRegion(value)}
      mapType="hybrid"
      showsBuildings={false}
      showsCompass={false}
      showsPointsOfInterests={false}
      showsTraffic={false}
      toolbarEnabled={false}
      style={styles.map}
      onPress={(event) => {
        onLocationPress(event.nativeEvent.coordinate);
      }}
    >
      {value && <Marker coordinate={value} />}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 288,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
