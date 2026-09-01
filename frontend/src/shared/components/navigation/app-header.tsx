import { LinearGradient } from 'expo-linear-gradient';
import {
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  IconButton,
} from '@/shared/components/ui/icon-button';

import {
  colors,
  gradients,
} from '@/shared/theme/colors';

type AppHeaderProps = {
  onMenuPress: () => void;
  onQrPress?: () => void;
};

export function AppHeader({
  onMenuPress,
  onQrPress,
}: AppHeaderProps) {
  return (
    <LinearGradient
      colors={gradients.header}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
    >
      <SafeAreaView
        edges={['top']}
      >
        <View
          className="
            relative
            h-16
            flex-row
            items-center
            px-3
          "
        >
          {/* Gloss effect */}
          <View
            pointerEvents="none"
            className="
              absolute
              left-0
              right-0
              top-0
              h-7
              bg-white/15
            "
          />

          <IconButton
            icon="menu"
            accessibilityLabel="Otvori meni"
            iconColor={
              colors.foreground
            }
            onPress={
              onMenuPress
            }
          />

          <Text
            numberOfLines={1}
            className="
              flex-1
              text-center
              text-lg
              font-bold
              tracking-tight
              text-foreground
            "
          >
            Pčelarski eDnevnik
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}