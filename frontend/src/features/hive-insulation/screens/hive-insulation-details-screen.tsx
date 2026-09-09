import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useHive } from '@/features/hives/hooks/use-hive';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { environment } from '@/shared/config/environment';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

import { useHiveInsulation } from '../hooks/use-hive-insulation';
import type { HiveInsulationDetails } from '../types/hive-insulation';

type HiveInsulationDetailsScreenProps = {
  hiveId: string;
  actionId: string;
};

export function HiveInsulationDetailsScreen({
  hiveId,
  actionId,
}: HiveInsulationDetailsScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const insulationQuery = useHiveInsulation(hiveId, actionId);

  if (hiveQuery.isLoading || insulationQuery.isLoading) {
    return <LoadingState />;
  }

  if (hiveQuery.isError || insulationQuery.isError || !hiveQuery.data || !insulationQuery.data) {
    return (
      <ErrorState
        onRetry={() => {
          void Promise.all([hiveQuery.refetch(), insulationQuery.refetch()]);
        }}
      />
    );
  }

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na istoriju aktivnosti"
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-base font-semibold text-primary">← Istorija aktivnosti</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Izolacija košnice</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Evidentirani podaci o izolaciji za košnicu {hiveQuery.data.label}.
        </Text>

        <Details insulation={insulationQuery.data} />
      </ScrollView>
    </Screen>
  );
}

function Details({ insulation }: { insulation: HiveInsulationDetails }) {
  const rows = [
    {
      label: 'Operacija',
      value: insulation.operation === 'add' ? 'Dodavanje izolacije' : 'Uklanjanje izolacije',
    },
    { label: 'Datum i vreme', value: formatDateTime(insulation.performedAt) },
    { label: 'Materijali', value: getMaterials(insulation) },
    {
      label: 'Način evidencije',
      value: insulation.actionGroupId ? 'Grupna akcija' : 'Pojedinačna akcija',
    },
  ];

  return (
    <>
      <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Podaci o izolaciji</Text>
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

      {insulation.notes?.trim() && (
        <>
          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Napomena</Text>
          <View className="rounded-3xl border border-border bg-surface px-5 py-4">
            <Text className="text-base leading-6 text-foreground">{insulation.notes.trim()}</Text>
          </View>
        </>
      )}

      {insulation.imageUrl && (
        <>
          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Fotografija</Text>
          <View className="h-64 overflow-hidden rounded-3xl border border-border bg-surface">
            <Image
              source={`${environment.apiUrl}${insulation.imageUrl}`}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        </>
      )}
    </>
  );
}

function getMaterials(insulation: HiveInsulationDetails) {
  return [
    insulation.paper ? 'Papir' : null,
    insulation.eps ? 'Stiropor' : null,
    insulation.xps ? 'Stirodur' : null,
  ]
    .filter(Boolean)
    .join(' • ');
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

function LoadingState() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted">Učitavanje izolacije...</Text>
      </View>
    </Screen>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-center text-base font-semibold text-error">
          Nije moguće učitati izolaciju.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
        >
          <Text className="font-bold text-background">Pokušaj ponovo</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
