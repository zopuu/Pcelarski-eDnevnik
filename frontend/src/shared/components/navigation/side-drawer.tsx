import {
  useEffect,
  useRef,
  useState,
} from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

type SideDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

const ANIMATION_DURATION = 220;

export function SideDrawer({
  visible,
  onClose,
  onLogout,
  isLoggingOut = false,
}: SideDrawerProps) {
  const { width } =
    useWindowDimensions();

  /*
   * 60% of phone width.
   * Maximum prevents it becoming huge
   * on tablets/web.
   */
  const drawerWidth =
    Math.min(
      width * 0.6,
      360,
    );

  const animation =
    useRef(
      new Animated.Value(0),
    ).current;

  const [mounted, setMounted] =
    useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);

      Animated.timing(
        animation,
        {
          toValue: 1,
          duration:
            ANIMATION_DURATION,
          useNativeDriver: true,
        },
      ).start();

      return;
    }

    if (!mounted) {
      return;
    }

    Animated.timing(
      animation,
      {
        toValue: 0,
        duration:
          ANIMATION_DURATION,
        useNativeDriver: true,
      },
    ).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [
    animation,
    mounted,
    visible,
  ]);

  if (!mounted) {
    return null;
  }

  const translateX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        -drawerWidth,
        0,
      ],
    });

  const overlayOpacity =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0,
        0.4,
      ],
    });

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <View
        style={styles.root}
      >
        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={
            onClose
          }
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.overlay,
              {
                opacity:
                  overlayOpacity,
              },
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.drawer,
            {
              width:
                drawerWidth,

              transform: [
                {
                  translateX,
                },
              ],
            },
          ]}
        >
          <SafeAreaView
            edges={[
              'top',
              'bottom',
            ]}
            className="
    flex-1
    bg-surface
  "
          >
            <View className="flex-1">
              {/*
      Navigation items will go here later.
    */}

              <View className="flex-1" />

              <View
                className="
        border-t
        border-border
        px-4
        py-4
      "
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Odjavi se"
                  disabled={isLoggingOut}
                  onPress={onLogout}
                  className="
          min-h-14
          flex-row
          items-center
          rounded-2xl
          px-4
          active:bg-error/10
          disabled:opacity-50
        "
                >
                  {isLoggingOut ? (
                    <ActivityIndicator
                      size="small"
                      color="#C2413B"
                    />
                  ) : (
                    <Ionicons
                      name="log-out-outline"
                      size={24}
                      color="#C2413B"
                    />
                  )}

                  <Text
                    className="
            ml-3
            text-base
            font-semibold
            text-error
          "
                  >
                    {isLoggingOut
                      ? 'Odjavljivanje...'
                      : 'Odjavi se'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
    },

    overlay: {
      backgroundColor:
        '#000000',
    },

    drawer: {
      flex: 1,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 4,
        height: 0,
      },

      shadowOpacity: 0.2,
      shadowRadius: 12,

      elevation: 12,
    },
  });