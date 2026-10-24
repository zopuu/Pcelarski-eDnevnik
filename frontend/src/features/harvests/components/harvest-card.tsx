import Ionicons from '@react-native-vector-icons/ionicons';
import { TimelineDate } from '@/shared/components/timeline/timeline-date';
import { TimelineItem } from '@/shared/components/timeline/timeline-item';
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
    <TimelineItem
      date={<TimelineDate variant="instant" value={harvest.harvestedOn} showTime={false} />}
      isFirst={isFirst}
      isLast={isLast}
    >
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
    </TimelineItem>
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
