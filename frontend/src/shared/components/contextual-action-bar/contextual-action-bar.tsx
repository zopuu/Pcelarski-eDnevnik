import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import Svg, { Polygon } from 'react-native-svg';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme/colors';

import type { ContextualAction } from './types';
import { CONTEXTUAL_ACTION_BAR_HEIGHT } from './layout';

type ContextualActionBarProps = {
  primaryAction: ContextualAction;

  leftActions?: ContextualAction[];

  rightActions?: ContextualAction[];
};

function MobileAction({ action }: { action?: ContextualAction }) {
  if (!action || action.hidden) {
    return <View className="flex-1" />;
  }

  const isDisabled = action.disabled || action.loading;

  return (
    <View
      className="
        flex-1
        items-center
        justify-center
      "
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action.accessibilityLabel ?? action.label}
        disabled={isDisabled}
        hitSlop={8}
        onPress={action.onPress}
        className="
          min-h-14
          min-w-14
          items-center
          justify-center
          px-1
        "
        style={({ pressed }) => ({
          opacity: isDisabled ? 0.4 : pressed ? 0.6 : 1,
        })}
      >
        {action.loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name={action.icon}
            size={23}
            color={action.variant === 'danger' ? colors.error : colors.foreground}
          />
        )}

        <Text
          numberOfLines={1}
          className={`
            mt-1
            text-[11px]
            font-medium
            ${action.variant === 'danger' ? 'text-error' : 'text-muted'}
          `}
        >
          {action.label}
        </Text>
      </Pressable>
    </View>
  );
}

function MobilePrimaryAction({ action }: { action: ContextualAction }) {
  if (action.hidden) {
    return <View className="flex-1" />;
  }

  const isDisabled = action.disabled || action.loading;

  return (
    <View
      className="
        flex-1
        items-center
      "
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action.accessibilityLabel ?? action.label}
        disabled={isDisabled}
        onPress={action.onPress}
        className="
          -translate-y-5
          items-center
          justify-center
        "
        style={({ pressed }) => ({
          opacity: isDisabled ? 0.5 : pressed ? 0.75 : 1,
        })}
      >
        <View
          className="
            h-20
            w-20
            items-center
            justify-center
          "
        >
          <Svg
            width={64}
            height={58}
            viewBox="0 0 64 58"
            style={{
              position: 'absolute',
            }}
          >
            <Polygon
              points="
                16,1
                48,1
                63,29
                48,57
                16,57
                1,29
              "
              fill={colors.primary}
            />
          </Svg>

          {action.loading ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons name={action.icon} size={28} color={colors.onPrimary} />
          )}
        </View>

        <Text
          numberOfLines={1}
          className="
            mt-1
            text-xs
            font-bold
            text-foreground
          "
        >
          {action.label}
        </Text>
      </Pressable>
    </View>
  );
}

function MobileContextualActionBar({
  primaryAction,
  leftActions = [],
  rightActions = [],
}: ContextualActionBarProps) {
  const insets = useSafeAreaInsets();

  const left = leftActions.filter((action) => !action.hidden).slice(0, 2);

  const right = rightActions.filter((action) => !action.hidden).slice(0, 2);

  return (
    <View
      className="
        absolute
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-border
        bg-surface
      "
      style={{
        paddingBottom: insets.bottom,

        minHeight: CONTEXTUAL_ACTION_BAR_HEIGHT + insets.bottom,
      }}
    >
      <View
        className="
    flex-row
    items-center
    px-1
  "
        style={{
          height: CONTEXTUAL_ACTION_BAR_HEIGHT,
        }}
      >
        <MobileAction action={left[0]} />

        <MobileAction action={left[1]} />

        <MobilePrimaryAction action={primaryAction} />

        <MobileAction action={right[0]} />

        <MobileAction action={right[1]} />
      </View>
    </View>
  );
}

function WebAction({ action, primary = false }: { action: ContextualAction; primary?: boolean }) {
  if (action.hidden) {
    return null;
  }

  const isDisabled = action.disabled || action.loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel ?? action.label}
      disabled={isDisabled}
      onPress={action.onPress}
      className={
        primary
          ? `
            min-h-11
            flex-row
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-4
          `
          : `
            min-h-11
            flex-row
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-border
            bg-surface
            px-4
          `
      }
      style={({ pressed }) => ({
        opacity: isDisabled ? 0.45 : pressed ? 0.7 : 1,
      })}
    >
      {action.loading ? (
        <ActivityIndicator size="small" color={primary ? colors.onPrimary : colors.primary} />
      ) : (
        <Ionicons
          name={action.icon}
          size={19}
          color={
            primary
              ? colors.onPrimary
              : action.variant === 'danger'
                ? colors.error
                : colors.foreground
          }
        />
      )}

      <Text
        className={
          primary
            ? `
              text-sm
              font-semibold
              text-white
            `
            : `
              text-sm
              font-semibold
              text-foreground
            `
        }
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

function WebContextualActionBar({
  primaryAction,
  leftActions = [],
  rightActions = [],
}: ContextualActionBarProps) {
  const actions = [...leftActions, primaryAction, ...rightActions];

  return (
    <View
      className="
        border-b
        border-border
        bg-background
        px-4
        py-3
      "
    >
      <View
        className="
          mx-auto
          w-full
          max-w-7xl
          flex-row
          flex-wrap
          items-center
          justify-end
          gap-2
        "
      >
        {actions.map((action) => (
          <WebAction key={action.key} action={action} primary={action.key === primaryAction.key} />
        ))}
      </View>
    </View>
  );
}

export function ContextualActionBar(props: ContextualActionBarProps) {
  if (Platform.OS === 'web') {
    return <WebContextualActionBar {...props} />;
  }

  return <MobileContextualActionBar {...props} />;
}
