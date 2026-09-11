import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import type { HarvestListItem } from '../types/harvest';
import { formatAmount, formatHarvestDate, hasDistinctBatchName } from '../utils/harvest-format';

export function HarvestCard({
  harvest,
  onPress,
  isFirst,
  isLast,
}: {
  harvest: HarvestListItem;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <View className="flex-row">
      <View className="w-16 items-end justify-center pr-3">
        <Text className="text-right text-xs font-bold text-foreground">
          {formatHarvestDate(harvest.harvestedOn)}
        </Text>
      </View>
      <View className="relative w-7 items-center justify-center">
        {!isFirst && <View className="absolute top-0 w-px bg-border" style={{ bottom: '50%' }} />}
        {!isLast && <View className="absolute bottom-0 w-px bg-border" style={{ top: '50%' }} />}
        <View className="z-10 h-4 w-4 rounded-full border-4 border-background bg-primary" />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Otvori vrcanje od ${formatHarvestDate(harvest.harvestedOn)}`}
        onPress={onPress}
        className="mb-5 flex-1 rounded-3xl border border-border bg-surface px-4 py-4"
        style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">
              {formatAmount(harvest.honeyAmount, harvest.unit)}
            </Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons name="water-outline" size={23} color={colors.primary} />
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Metric icon="albums-outline" value={`${harvest.harvestedFrameCount} ramova`} />
          <Metric icon="layers-outline" value={`${harvest.superCount} nastavaka`} />
        </View>

        <View className="mt-4 border-t border-border pt-4">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {hasDistinctBatchName(harvest.batchName, harvest.batchCode) ? harvest.batchName : harvest.batchCode}
          </Text>
          {hasDistinctBatchName(harvest.batchName, harvest.batchCode) && (
            <Text className="mt-0.5 text-xs text-muted">{harvest.batchCode}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

function Metric({ icon, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; value: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text className="text-sm text-muted">{value}</Text>
    </View>
  );
}
