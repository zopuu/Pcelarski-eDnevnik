import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import type { AvailableHarvestGroup } from '../types/harvest';
import { formatPeriod } from '../utils/harvest-format';

export function HarvestGroupCard({
  group,
  selected,
  expanded,
  onSelect,
  onToggleExpanded,
}: {
  group: AvailableHarvestGroup;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpanded: () => void;
}) {
  const locationNames = Array.from(new Set(
    group.exposurePath.flatMap((segment) =>
      segment.locations.map((location) => location.name?.trim() || 'Lokacija bez naziva'),
    ),
  ));

  return (
    <View className={`rounded-3xl border bg-surface ${selected ? 'border-primary' : 'border-border'}`}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={onSelect}
        className="px-5 py-5"
        style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      >
        <View className="flex-row items-start gap-3">
          <View className={`mt-0.5 h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-primary bg-primary' : 'border-border'}`}>
            {selected && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              {formatPeriod(group.periodStartedOn, group.periodEndedOn)}
            </Text>
            <Text className="mt-2 text-sm text-muted">
              {group.totalRemainingFrameCount} dostupnih ramova · {group.superCount} nastavaka
            </Text>
            {locationNames.length > 0 && (
              <Text className="mt-2 text-sm text-muted" numberOfLines={2}>
                {locationNames.join(' → ')}
              </Text>
            )}
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onToggleExpanded}
        className="min-h-12 flex-row items-center justify-center gap-2 border-t border-border px-4"
      >
        <Text className="text-sm font-semibold text-primary">
          {expanded ? 'Sakrij nastavke' : 'Prikaži nastavke'}
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={colors.primary} />
      </Pressable>

      {expanded && (
        <View className="border-t border-border px-5 py-4">
          {group.supers.map((item, index) => (
            <View key={item.hiveSuperStayId} className={`${index > 0 ? 'mt-3 border-t border-border pt-3' : ''} flex-row justify-between gap-3`}>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">{item.hiveLabel}</Text>
                <Text className="mt-0.5 text-xs text-muted">
                  Boravak: {formatPeriod(item.startedOn, item.endedOn)}
                </Text>
              </View>
              <Text className="font-bold text-primary">{item.remainingHarvestableFrameCount} ram.</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
