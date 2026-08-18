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

type AddApiaryCardProps = {
  onPress: () => void;
};

export function AddApiaryCard({
  onPress,
}: AddApiaryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="
        h-28
        overflow-hidden
        rounded-3xl
        border
        border-border
        shadow-sm
        active:opacity-80
      "
    >
      <LinearGradient
        colors={
          gradients.addApiary
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
        className="
          absolute
          -right-10
          -top-16
          h-40
          w-40
          rounded-full
          bg-primary/10
        "
      />

      <View
        className="
          flex-1
          flex-row
          items-center
          justify-center
          gap-3
        "
      >
        <View
          className="
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-primary
          "
        >
          <Ionicons
            name="add"
            size={31}
            color={
              colors.white
            }
          />
        </View>

        <Text
          className="
            text-lg
            font-bold
            text-foreground
          "
        >
          Dodaj pčelinjak
        </Text>
      </View>
    </Pressable>
  );
}