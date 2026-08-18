import Ionicons from '@react-native-vector-icons/ionicons';
import {
  Pressable,
  type PressableProps,
} from 'react-native';

type IconName =
  React.ComponentProps<
    typeof Ionicons
  >['name'];

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  iconSize?: number;
  iconColor?: string;
} & Omit<
  PressableProps,
  'children'
>;

export function IconButton({
  icon,
  accessibilityLabel,
  iconSize = 26,
  iconColor = '#2A1D0B',
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel
      }
      hitSlop={8}
      className="
        h-12
        w-12
        items-center
        justify-center
        rounded-2xl
        active:bg-black/10
      "
    >
      <Ionicons
        name={icon}
        size={iconSize}
        color={iconColor}
      />
    </Pressable>
  );
}