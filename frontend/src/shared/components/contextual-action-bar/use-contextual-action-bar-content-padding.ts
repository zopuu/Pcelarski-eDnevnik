import {
  Platform,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const MOBILE_ACTION_BAR_CONTENT_PADDING =
  112;

export function useContextualActionBarContentPadding() {
  const insets =
    useSafeAreaInsets();

  if (
    Platform.OS === 'web'
  ) {
    return 40;
  }

  return (
    MOBILE_ACTION_BAR_CONTENT_PADDING +
    insets.bottom
  );
}