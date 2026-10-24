import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import type { HoneyBatchListItem } from '../types/harvest';
import {
  formatAmount,
  formatPeriod,
  getBatchStatusLabel,
  hasDistinctBatchName,
} from '../utils/harvest-format';

export function HoneyBatchCard({
  batch,
  onPress,
}: {
  batch: HoneyBatchListItem;
  onPress: () => void;
}) {
  const isOpen = batch.status.toLocaleLowerCase() === 'open';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Otvori seriju ${batch.batchCode}`}
      onPress={onPress}
      className="rounded-3xl border border-border bg-surface px-5 py-5"
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
            {hasDistinctBatchName(batch.name, batch.batchCode) ? batch.name : batch.batchCode}
          </Text>
          {hasDistinctBatchName(batch.name, batch.batchCode) && (
            <Text className="mt-1 text-sm font-semibold text-primary">{batch.batchCode}</Text>
          )}
        </View>
        <View
          className={`rounded-full px-3 py-1.5 ${isOpen ? 'bg-success/10' : 'bg-surface-warm'}`}
        >
          <Text className={`text-xs font-bold ${isOpen ? 'text-success' : 'text-muted'}`}>
            {getBatchStatusLabel(batch.status)}
          </Text>
        </View>
      </View>

      <Text className="mt-5 text-2xl font-bold text-foreground">
        {formatAmount(batch.totalAmount, batch.unit)}
      </Text>
      <Text className="mt-1 text-sm text-muted">
        Poreklo: {formatPeriod(batch.periodStartedOn, batch.periodEndedOn)}
      </Text>

      <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
        <Metric icon="water-outline" value={`${batch.harvestCount} vrcanja`} />
        <Metric icon="albums-outline" value={`${batch.totalHarvestedFrameCount} ramova`} />
        <Metric
          icon={batch.hasComposition ? 'checkmark-circle-outline' : 'flask-outline'}
          value={batch.hasComposition ? 'Sastav određen' : 'Sastav nije određen'}
        />
      </View>
    </Pressable>
  );
}

function Metric({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text className="text-sm text-muted">{value}</Text>
    </View>
  );
}
