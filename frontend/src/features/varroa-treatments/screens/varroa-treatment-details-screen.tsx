import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useHive } from '@/features/hives/hooks/use-hive';
import { colors } from '@/shared/theme/colors';

import { useVarroaTreatment } from '../hooks/use-varroa-treatment';
import type {
  VarroaApplicationMethod,
  VarroaDoseUnit,
  VarroaTreatmentDetails,
} from '../types/varroa-treatment';

type VarroaTreatmentDetailsScreenProps = {
  hiveId: string;
  treatmentId: string;
};

const applicationMethodLabels: Record<VarroaApplicationMethod, string> = {
  strips: 'Trake',
  fumigation: 'Dimljenje',
  trickling: 'Nakapavanje',
  vaporization: 'Isparavanje',
  spraying: 'Prskanje',
  other: 'Drugo',
};

const doseUnitLabels: Record<VarroaDoseUnit, string> = {
  ml: 'ml',
  strips: 'trake',
  g: 'g',
};

export function VarroaTreatmentDetailsScreen({
  hiveId,
  treatmentId,
}: VarroaTreatmentDetailsScreenProps) {
  const hiveQuery = useHive(hiveId);
  const treatmentQuery = useVarroaTreatment(hiveId, treatmentId);

  if (hiveQuery.isLoading || treatmentQuery.isLoading) {
    return <LoadingState />;
  }

  if (hiveQuery.isError || treatmentQuery.isError || !hiveQuery.data || !treatmentQuery.data) {
    return (
      <ErrorState
        onRetry={() => {
          void Promise.all([hiveQuery.refetch(), treatmentQuery.refetch()]);
        }}
      />
    );
  }

  const treatment = treatmentQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Vrati se na istoriju aktivnosti"
        onPress={() => router.back()}
        className="mb-3 min-h-11 self-start justify-center py-2"
      >
        <Text className="text-base font-semibold text-primary">← Istorija aktivnosti</Text>
      </Pressable>

      <Text className="text-2xl font-bold text-foreground">Tretman protiv varoe</Text>
      <Text className="mt-1 text-sm leading-5 text-muted">
        Evidentirani podaci o tretmanu za košnicu {hiveQuery.data.label}.
      </Text>

      <Details treatment={treatment} />
    </ScrollView>
  );
}

function Details({ treatment }: { treatment: VarroaTreatmentDetails }) {
  const rows = [
    {
      label: 'Datum i vreme tretmana',
      value: formatDateTime(treatment.performedAt),
    },
    {
      label: 'Preparat',
      value: treatment.productName,
    },
    {
      label: 'Način primene',
      value: applicationMethodLabels[treatment.applicationMethod],
    },
    {
      label: 'Doza po košnici',
      value: `${formatAmount(treatment.doseAmount)} ${doseUnitLabels[treatment.doseUnit]}`,
    },
  ];

  return (
    <>
      <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Podaci o tretmanu</Text>
      <View className="rounded-3xl border border-border bg-surface px-5 py-1">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={`flex-row items-start justify-between gap-6 py-3 ${
              index === rows.length - 1 ? '' : 'border-b border-border'
            }`}
          >
            <Text className="flex-1 text-sm text-muted">{row.label}</Text>
            <Text className="flex-1 text-right text-sm font-semibold text-foreground">
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      {treatment.notes?.trim() && (
        <>
          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Napomena</Text>
          <View className="rounded-3xl border border-border bg-surface px-5 py-4">
            <Text className="text-base leading-6 text-foreground">{treatment.notes.trim()}</Text>
          </View>
        </>
      )}
    </>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('sr-Latn-RS', {
    maximumFractionDigits: 2,
  }).format(value);
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">Učitavanje tretmana...</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati tretman.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
      >
        <Text className="font-bold text-background">Pokušaj ponovo</Text>
      </Pressable>
    </View>
  );
}
