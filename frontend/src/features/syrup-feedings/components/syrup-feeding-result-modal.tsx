import Ionicons from '@react-native-vector-icons/ionicons';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/theme/colors';

import type { RecordSyrupFeedingResponse } from '../types/syrup-feeding';

type SyrupFeedingResultModalProps = {
  result: RecordSyrupFeedingResponse | null;
  hiveLabels: Record<string, string>;
  onDone: () => void;
};

export function SyrupFeedingResultModal({
  result,
  hiveLabels,
  onDone,
}: SyrupFeedingResultModalProps) {
  if (!result) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onDone}>
      <View className="flex-1 items-center justify-center bg-black/45 px-5">
        <View className="w-full max-w-md overflow-hidden rounded-3xl bg-surface">
          <View className="items-center bg-primary px-6 pb-6 pt-7">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
              <Ionicons name="checkmark" size={32} color={colors.success} />
            </View>
            <Text className="mt-3 text-xl font-bold text-white">Prihrana je sačuvana</Text>
            <Text className="mt-1 text-center text-sm leading-5 text-white/90">
              Evidentirana je za {result.affectedHiveCount}{' '}
              {result.affectedHiveCount === 1 ? 'košnicu.' : 'košnice.'}
            </Text>
          </View>

          <View className="px-5 pb-5 pt-6">
            <ResultRow label="Ukupno sirupa" value={formatMilliliters(result.totalSyrupMl)} />
            <ResultRow label="Procenjeno šećera" value={formatKilograms(result.estimatedSugarKg)} />
            <ResultRow label="Procenjeno vode" value={formatKilograms(result.estimatedWaterKg)} />

            <View className="mt-5 rounded-2xl bg-surface-warm px-4 py-3">
              <Text className="text-xs font-bold uppercase tracking-wide text-muted">
                Po košnicama
              </Text>
              <View className="mt-2 gap-1.5">
                {result.actions.map((action, index) => (
                  <Text key={action.actionId} className="text-sm font-semibold text-foreground">
                    {hiveLabels[action.hiveId] ?? `Košnica ${index + 1}`}:{' '}
                    {formatMilliliters(action.quantityMl)}
                  </Text>
                ))}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zatvori rezultat prihrane"
              onPress={onDone}
              className="mt-6 min-h-13 items-center justify-center rounded-2xl bg-primary px-5"
            >
              <Text className="text-base font-bold text-white">Gotovo</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border py-3">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-base font-bold text-foreground">{value}</Text>
    </View>
  );
}

function formatMilliliters(value: number) {
  return `${new Intl.NumberFormat('sr-RS').format(value)} ml`;
}

function formatKilograms(value: number) {
  return `${new Intl.NumberFormat('sr-RS', {
    maximumFractionDigits: 3,
  }).format(value)} kg`;
}
