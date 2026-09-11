import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import type { HarvestListItem } from '../types/harvest';
import { formatAmount, formatHarvestDate } from '../utils/harvest-format';

export function HarvestCard({
  harvest,
  onPress,
}: {
  harvest: HarvestListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Otvori vrcanje od ${formatHarvestDate(harvest.harvestedOn)}`}
      onPress={onPress}
      className="rounded-3xl border border-border bg-surface px-5 py-5"
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted">
            {formatHarvestDate(harvest.harvestedOn)}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-foreground">
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
          {harvest.batchName}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">{harvest.batchCode}</Text>
      </View>
    </Pressable>
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
