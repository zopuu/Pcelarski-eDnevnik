import type {
  ReactNode,
} from 'react';

import {
  Platform,
  View,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  CONTEXTUAL_ACTION_BAR_RESERVED_HEIGHT,
} from '@/shared/components/contextual-action-bar/layout';

type ScreenProps = {
  children: ReactNode;

  header?: ReactNode;

  contextualActionBar?: ReactNode;
};

export function Screen({
  children,
  header,
  contextualActionBar,
}: ScreenProps) {
  const insets =
    useSafeAreaInsets();

  const hasContextualActionBar =
    contextualActionBar != null;

  const isWeb =
    Platform.OS === 'web';

  const mobileBottomSpace =
    !isWeb &&
    hasContextualActionBar
      ? CONTEXTUAL_ACTION_BAR_RESERVED_HEIGHT +
        insets.bottom
      : 0;

  return (
    <View
      className="
        flex-1
        bg-background
      "
    >
      {header}

      {isWeb &&
        contextualActionBar}

      <View
        className="flex-1"
        style={{
          paddingBottom:
            mobileBottomSpace,
        }}
      >
        {children}
      </View>

      {!isWeb &&
        contextualActionBar}
    </View>
  );
}