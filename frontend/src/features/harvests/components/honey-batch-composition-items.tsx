import { Text, View } from 'react-native';
import type { HoneyBatchCompositionItem } from '../types/harvest';
import { getForageLabel } from '../utils/harvest-format';

export function HoneyBatchCompositionItems({ items }: { items: HoneyBatchCompositionItem[] }) {
  const sortedItems = [...items].sort((left, right) => right.percentage - left.percentage || left.forageType.localeCompare(right.forageType, 'sr-Latn-RS'));

  return (
    <View className="mt-4 gap-4">
      {sortedItems.map((item) => (
        <View key={item.id}>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-base font-semibold text-foreground">{getForageLabel(item.forageType)}</Text>
            <Text className="text-lg font-bold text-primary">{item.percentage}%</Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-surface-warm">
            <View className="h-full rounded-full bg-primary" style={{ width: `${item.percentage}%` }} />
          </View>
          {item.notes && <Text className="mt-2 text-sm leading-5 text-muted">{item.notes}</Text>}
        </View>
      ))}
    </View>
  );
}
