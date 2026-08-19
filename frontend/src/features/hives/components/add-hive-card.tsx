import Ionicons from '@react-native-vector-icons/ionicons';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  colors,
} from '@/shared/theme/colors';

type AddHiveCardProps = {
  onPress: () => void;
};

export function AddHiveCard({
  onPress,
}: AddHiveCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="
        min-h-20
        flex-row
        items-center
        justify-center
        gap-3
        rounded-3xl
        border
        border-dashed
        border-primary
        bg-primary/5
        px-5
        active:opacity-70
      "
    >
      <View
        className="
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-primary
        "
      >
        <Ionicons
          name="add"
          size={24}
          color={
            colors.background
          }
        />
      </View>

      <Text
        className="
          text-base
          font-bold
          text-primary
        "
      >
        Dodaj košnicu
      </Text>
    </Pressable>
  );
}