import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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

const ACTION_HEIGHT = 50;
const HEADER_HEIGHT = 92;
const OPEN_ANIMATION_DURATION = 220;
const CLOSE_DRAG_DISTANCE = 100;

function OpenActionOverflowSheet({
  title = 'Više opcija',
  actions,
  onClose,
}: Omit<ActionOverflowSheetProps, 'visible'>) {
  const insets =
    useSafeAreaInsets();
  const { height: windowHeight } =
    useWindowDimensions();

  const visibleActions =
    actions.filter(
      (action) =>
        !action.hidden,
    );

  const bottomPadding =
    Math.max(insets.bottom, 16);
  const contentHeight =
    HEADER_HEIGHT +
    visibleActions.length * ACTION_HEIGHT +
    bottomPadding;
  const maxHeight =
    Math.min(
      windowHeight * 0.85,
      contentHeight,
    );
  const hasOverflow = contentHeight > maxHeight;
  const collapsedHeight =
    Math.min(
      maxHeight,
      Math.max(
        200,
        Math.min(260, windowHeight * 0.38),
      ),
    );
  const sheetHeight =
    useRef(
      new Animated.Value(maxHeight),
    ).current;
  const entryOffset =
    useRef(
      new Animated.Value(windowHeight),
    ).current;
  const dragStartHeight =
    useRef(maxHeight);
  const [isExpanded, setIsExpanded] =
    useState(true);

  useEffect(() => {
    Animated.timing(entryOffset, {
      toValue: 0,
      duration: OPEN_ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [entryOffset]);

  const snapTo = useCallback((height: number) => {
    if (height < maxHeight) {
      setIsExpanded(false);
    }
    Animated.spring(sheetHeight, {
      toValue: height,
      useNativeDriver: false,
      bounciness: 0,
    }).start(({ finished }) => {
      if (finished && height === maxHeight) {
        setIsExpanded(true);
      }
    });
  }, [maxHeight, sheetHeight]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 6 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          setIsExpanded(false);
          entryOffset.stopAnimation();
          sheetHeight.stopAnimation((height) => {
            dragStartHeight.current = height;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const remainingCollapse =
            dragStartHeight.current - collapsedHeight;
          sheetHeight.setValue(
            Math.max(
              collapsedHeight,
              Math.min(
                maxHeight,
                dragStartHeight.current - gesture.dy,
              ),
            ),
          );
          entryOffset.setValue(
            Math.max(0, gesture.dy - remainingCollapse),
          );
        },
        onPanResponderRelease: (_, gesture) => {
          if (
            gesture.dy >
              dragStartHeight.current - collapsedHeight +
                CLOSE_DRAG_DISTANCE ||
            (gesture.dy > 35 && gesture.vy > 1.4)
          ) {
            Animated.timing(entryOffset, {
              toValue: windowHeight,
              duration: OPEN_ANIMATION_DURATION,
              useNativeDriver: false,
            }).start(({ finished }) => {
              if (finished) {
                onClose();
              }
            });
            return;
          }

          Animated.spring(entryOffset, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 0,
          }).start();

          if (gesture.dy < -35 || gesture.vy < -0.6) {
            snapTo(maxHeight);
          } else if (gesture.dy > 35 || gesture.vy > 0.6) {
            snapTo(maxHeight);                                //collapsedHeight if using collapsed option
          } else {
            snapTo(
              dragStartHeight.current - gesture.dy >
                (collapsedHeight + maxHeight) / 2
                ? maxHeight
                : collapsedHeight,
            );
          }
        },
        onPanResponderTerminate: () => {
          snapTo(dragStartHeight.current);
          Animated.spring(entryOffset, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 0,
          }).start();
        },
      }),
    [collapsedHeight, entryOffset, maxHeight, onClose, sheetHeight, snapTo, windowHeight],
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
      visible
      transparent
      animationType="none"
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

        <Animated.View
          className="
            rounded-t-3xl
            border-t
            border-border
            bg-surface
            px-4
            pt-4
          "
          style={{
            height: sheetHeight,
            paddingBottom: bottomPadding,
            transform: [{ translateY: entryOffset }],
          }}
        >
          <View
            className="
              mb-3
              items-center
            "
            {...panResponder.panHandlers}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Promeni veličinu menija"
              onPress={() => {
                sheetHeight.stopAnimation((height) => {
                  snapTo(
                    height > (collapsedHeight + maxHeight) / 2
                      ? collapsedHeight
                      : maxHeight,
                  );
                });
              }}
              className="min-h-8 w-full items-center justify-center"
            >
              <View
                className="h-1 w-10 rounded-full bg-border"
              />
            </Pressable>
            <Text
              numberOfLines={1}
              className="
                mt-1
                w-full
                text-lg
                font-bold
                text-foreground
              "
            >
              {title}
            </Text>
          </View>

          <ScrollView
            bounces={false}
            scrollEnabled={hasOverflow && isExpanded}
            showsVerticalScrollIndicator={hasOverflow && isExpanded}
            style={{ flex: 1 }}
          >
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
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function ActionOverflowSheet({
  visible,
  ...props
}: ActionOverflowSheetProps) {
  return visible ? (
    <OpenActionOverflowSheet {...props} />
  ) : null;
}
