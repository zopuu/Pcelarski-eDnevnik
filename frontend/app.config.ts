import type {
  ConfigContext,
  ExpoConfig,
} from 'expo/config';

export default ({
  config,
}: ConfigContext): ExpoConfig => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey:
          process.env
            .GOOGLE_MAPS_ANDROID_API_KEY,

        iosGoogleMapsApiKey:
          process.env
            .GOOGLE_MAPS_IOS_API_KEY,
      },
    ],
  ],
} as ExpoConfig);
