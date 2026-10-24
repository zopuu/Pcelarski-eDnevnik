import { Text, View } from 'react-native';
import type { HoneyBatchComposition } from '../types/harvest';
import { CompositionMethodBadge } from './composition-method-badge';
import { HoneyBatchCompositionItems } from './honey-batch-composition-items';

export function HoneyBatchCompositionCard({ composition }: { composition: HoneyBatchComposition }) {
  const determinedAt = new Intl.DateTimeFormat('sr-Latn-RS', { dateStyle: 'medium' }).format(
    new Date(composition.determinedAt),
  );

  return (
    <View className="rounded-3xl border border-border bg-surface px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">Sastav meda</Text>
          {composition.determinationMethod === 'Calculated' && (
            <Text className="mt-1 text-sm text-muted">Procena sistema</Text>
          )}
        </View>
        <CompositionMethodBadge method={composition.determinationMethod} />
      </View>

      <HoneyBatchCompositionItems items={composition.items} />

      <Text className="mt-4 border-t border-border pt-4 text-sm font-semibold text-foreground">
        Ukupno: 100%
      </Text>
      <Text className="mt-1 text-xs text-muted">Određeno: {determinedAt}</Text>
      {composition.determinationMethod === 'Calculated' && composition.algorithmVersion && (
        <Text className="mt-1 text-xs text-muted">Algoritam: {composition.algorithmVersion}</Text>
      )}
      {composition.determinationMethod === 'Laboratory' && composition.evidenceReference && (
        <View className="mt-4 border-t border-border pt-4">
          <Text className="text-sm font-bold text-foreground">Laboratorijski nalaz</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">{composition.evidenceReference}</Text>
        </View>
      )}
    </View>
  );
}
