import { Text, View } from 'react-native';
import type { HoneyBatchCompositionMethod } from '../types/harvest';
import { getDeterminationMethodLabel } from '../utils/harvest-format';

export function CompositionMethodBadge({ method }: { method: HoneyBatchCompositionMethod }) {
  const classes = method === 'Laboratory'
    ? { container: 'bg-success/10', text: 'text-success' }
    : method === 'Calculated'
      ? { container: 'bg-primary/10', text: 'text-primary' }
      : { container: 'bg-surface-warm', text: 'text-muted' };

  return (
    <View className={`rounded-full px-3 py-1.5 ${classes.container}`}>
      <Text className={`text-xs font-bold ${classes.text}`}>{getDeterminationMethodLabel(method)}</Text>
    </View>
  );
}
