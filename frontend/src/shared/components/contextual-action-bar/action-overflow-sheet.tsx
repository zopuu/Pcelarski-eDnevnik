import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons
  from '@react-native-vector-icons/ionicons';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  colors,
} from '@/shared/theme/colors';

import type {
  ContextualAction,
} from './types';

type ActionOverflowSheetProps = {
  visible: boolean;

  title?: string;

  actions: ContextualAction[];

  onClose: () => void;
};

export function ActionOverflowSheet({
  visible,
  title = 'Više opcija',
  actions,
  onClose,
}: ActionOverflowSheetProps) {
  const insets =
    useSafeAreaInsets();

  const visibleActions =
    actions.filter(
      (action) =>
        !action.hidden,
    );

  const handleActionPress = (
    action: ContextualAction,
  ) => {
    onClose();

    requestAnimationFrame(() => {
      action.onPress();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zatvori meni"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
          className="bg-black/40"
        />

        <View
          className="
            rounded-t-3xl
            border-t
            border-border
            bg-surface
            px-4
            pt-4
          "
          style={{
            paddingBottom:
              Math.max(
                insets.bottom,
                16,
              ),
          }}
        >
          <View
            className="
              mb-3
              items-center
            "
          >
            <View
              className="
                h-1
                w-10
                rounded-full
                bg-border
              "
            />
          </View>

          <Text
            className="
              mb-2
              text-lg
              font-bold
              text-foreground
            "
          >
            {title}
          </Text>

          {visibleActions.map(
            (action) => {
              const isDisabled =
                action.disabled ||
                action.loading;

              const isDanger =
                action.variant ===
                'danger';

              return (
                <Pressable
                  key={action.key}
                  accessibilityRole="button"
                  accessibilityLabel={
                    action
                      .accessibilityLabel ??
                    action.label
                  }
                  disabled={
                    isDisabled
                  }
                  onPress={() => {
                    handleActionPress(
                      action,
                    );
                  }}
                  className="
                    min-h-14
                    flex-row
                    items-center
                    rounded-2xl
                    px-3
                  "
                  style={({
                    pressed,
                  }) => ({
                    opacity:
                      isDisabled
                        ? 0.4
                        : pressed
                          ? 0.6
                          : 1,
                  })}
                >
                  <View
                    className="
                      w-10
                      items-center
                    "
                  >
                    {action.loading ? (
                      <ActivityIndicator
                        size="small"
                        color={
                          colors.primary
                        }
                      />
                    ) : (
                      <Ionicons
                        name={
                          action.icon
                        }
                        size={22}
                        color={
                          isDanger
                            ? colors.error
                            : colors
                                .foreground
                        }
                      />
                    )}
                  </View>

                  <Text
                    className={`
                      ml-2
                      flex-1
                      text-base
                      font-semibold
                      ${
                        isDanger
                          ? 'text-error'
                          : 'text-foreground'
                      }
                    `}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>
      </View>
    </Modal>
  );
}