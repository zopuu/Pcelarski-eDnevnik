import Ionicons from '@react-native-vector-icons/ionicons';
import { memo, useCallback, useRef, useState, type ReactNode } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { HiveHeaderIllustration } from '@/features/hives/components/hive-header-illustration';
import { colors } from '@/shared/theme/colors';

import type { UnplacedApiaryLayoutHive } from '../apiary-layout-selectors';

const CARD_WIDTH = 164;
const CARD_GAP = 8;

export type UnplacedHiveTrayProps = {
  hives: readonly UnplacedApiaryLayoutHive[];
  onHivePress?: (hiveId: string) => void;
  onHiveLongPress?: (hiveId: string) => void;
  disabledHiveIds?: ReadonlySet<string>;
  selectedHiveIds?: ReadonlySet<string>;
  renderCardContent?: (hive: UnplacedApiaryLayoutHive) => ReactNode;
  initiallyExpanded?: boolean;
  showWhenEmpty?: boolean;
};

type HiveTrayCardProps = {
  hive: UnplacedApiaryLayoutHive;
  disabled: boolean;
  selected: boolean;
  content?: ReactNode;
  onPress?: (hiveId: string) => void;
  onLongPress?: (hiveId: string) => void;
};

const HiveTrayCard = memo(function HiveTrayCard({
  hive,
  disabled,
  selected,
  content,
  onPress,
  onLongPress,
}: HiveTrayCardProps) {
  const longPressFired = useRef(false);
  const interactive = !disabled && Boolean(onPress || onLongPress);

  return (
    <Pressable
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityLabel={`Košnica ${hive.label}, nepostavljena`}
      accessibilityState={{ disabled, selected }}
      accessibilityActions={
        interactive
          ? [
              ...(onPress ? [{ name: 'activate' as const }] : []),
              ...(onLongPress ? [{ name: 'longpress' as const }] : []),
            ]
          : undefined
      }
      onAccessibilityAction={(event) => {
        if (!interactive) return;
        if (event.nativeEvent.actionName === 'activate') onPress?.(hive.id);
        if (event.nativeEvent.actionName === 'longpress') onLongPress?.(hive.id);
      }}
      onPressIn={() => {
        longPressFired.current = false;
      }}
      onPress={() => {
        if (!longPressFired.current) onPress?.(hive.id);
      }}
      onLongPress={() => {
        longPressFired.current = true;
        onLongPress?.(hive.id);
      }}
      delayLongPress={500}
      className={`min-h-20 flex-row items-center rounded-2xl border bg-surface px-2 py-2 active:opacity-80 ${
        selected ? 'border-primary bg-primary/10' : 'border-border'
      } ${disabled ? 'opacity-50' : ''}`}
      style={{ width: CARD_WIDTH }}
    >
      <HiveHeaderIllustration colorHex={hive.colorHex} size={54} accessible={false} />
      <View className="ml-1 min-w-0 flex-1 justify-center">
        <Text numberOfLines={2} ellipsizeMode="tail" className="text-sm font-bold text-foreground">
          {hive.label}
        </Text>
        {content}
      </View>
      {selected && (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute left-2 top-1 h-5 w-5 items-center justify-center rounded-full bg-primary"
        >
          <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
        </View>
      )}
    </Pressable>
  );
});

function CardSeparator() {
  return <View style={{ width: CARD_GAP }} />;
}

export function UnplacedHiveTray({
  hives,
  onHivePress,
  onHiveLongPress,
  disabledHiveIds,
  selectedHiveIds,
  renderCardContent,
  initiallyExpanded = true,
  showWhenEmpty = false,
}: UnplacedHiveTrayProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const renderItem = useCallback(
    ({ item }: { item: UnplacedApiaryLayoutHive }) => (
      <HiveTrayCard
        hive={item}
        disabled={disabledHiveIds?.has(item.id) ?? false}
        selected={selectedHiveIds?.has(item.id) ?? false}
        content={renderCardContent?.(item)}
        onPress={onHivePress}
        onLongPress={onHiveLongPress}
      />
    ),
    [disabledHiveIds, selectedHiveIds, renderCardContent, onHivePress, onHiveLongPress],
  );

  if (hives.length === 0 && !showWhenEmpty) return null;

  return (
    <View className="w-full overflow-hidden rounded-2xl border border-border bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Nepostavljene košnice (${hives.length})`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        className="min-h-12 flex-row items-center justify-between px-4 py-2 active:opacity-80"
      >
        <Text className="flex-1 text-base font-bold text-foreground">
          Nepostavljene košnice ({hives.length})
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
      </Pressable>
      <View
        style={{ display: expanded ? 'flex' : 'none' }}
        pointerEvents={expanded ? 'auto' : 'none'}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}
      >
        <FlatList
          horizontal
          directionalLockEnabled
          nestedScrollEnabled
          data={hives}
          keyExtractor={(hive) => hive.id}
          renderItem={renderItem}
          ItemSeparatorComponent={CardSeparator}
          ListEmptyComponent={
            <Text className="px-4 pb-3 text-sm text-muted">Nema nepostavljenih košnica.</Text>
          }
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + CARD_GAP,
            offset: (CARD_WIDTH + CARD_GAP) * index,
            index,
          })}
        />
      </View>
    </View>
  );
}
