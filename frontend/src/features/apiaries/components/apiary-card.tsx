import Ionicons from '@react-native-vector-icons/ionicons';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  gradients,
} from '@/shared/theme/colors';

type ApiaryCardProps = {
  name: string | null;
  onPress: () => void;
};

export function ApiaryCard({
  name,
  onPress,
}: ApiaryCardProps) {
  const displayName =
    name?.trim() ||
    'Pčelinjak bez naziva';

  return (
    <Pressable
      onPress={onPress}
      className="
        h-36
        overflow-hidden
        rounded-3xl
        border
        border-white/80
        shadow-md
        active:opacity-90
      "
    >
      <LinearGradient
        colors={
          gradients.apiary
        }
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={
          StyleSheet.absoluteFill
        }
      />

      <View
        pointerEvents="none"
        className="
          absolute
          left-0
          right-0
          top-0
          h-14
          bg-white/15
        "
      />

      <View
        pointerEvents="none"
        className="
          absolute
          -right-8
          -top-12
          h-40
          w-40
          rounded-full
          bg-white/15
        "
      />

      <View
        pointerEvents="none"
        className="
          absolute
          right-6
          top-6
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          bg-white/25
        "
      >
        <Ionicons
          name="leaf-outline"
          size={42}
          color={
            colors.primaryDark
          }
        />
      </View>

      <LinearGradient
        colors={[
          'transparent',
          'rgba(42, 29, 11, 0.72)',
        ]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 72,
        }}
      />

      <View
        className="
          absolute
          bottom-0
          left-0
          right-0
          flex-row
          items-center
          px-5
          pb-4
        "
      >
        <Text
          numberOfLines={1}
          className="
            flex-1
            text-xl
            font-bold
            text-white
          "
        >
          {displayName}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={22}
          color={
            colors.white
          }
        />
      </View>
    </Pressable>
  );
}