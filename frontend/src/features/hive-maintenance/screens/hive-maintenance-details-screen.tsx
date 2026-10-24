import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useHive } from '@/features/hives/hooks/use-hive';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { environment } from '@/shared/config/environment';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

import { useHiveMaintenance } from '../hooks/use-hive-maintenance';
import type { HiveMaintenanceDetails } from '../types/hive-maintenance';
import { getMaintenanceTypeLabel } from '../utils/maintenance-labels';

export function HiveMaintenanceDetailsScreen({
  hiveId,
  actionId,
}: {
  hiveId: string;
  actionId: string;
}) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const maintenanceQuery = useHiveMaintenance(hiveId, actionId);
  if (hiveQuery.isLoading || maintenanceQuery.isLoading)
    return <StateScreen label="Učitavanje održavanja..." />;
  if (hiveQuery.isError || maintenanceQuery.isError || !hiveQuery.data || !maintenanceQuery.data)
    return (
      <StateScreen
        label="Nije moguće učitati održavanje."
        retry={() => void Promise.all([hiveQuery.refetch(), maintenanceQuery.refetch()])}
      />
    );
  const maintenance = maintenanceQuery.data;
  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na istoriju aktivnosti"
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-base font-semibold text-primary">← Istorija aktivnosti</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-foreground">Održavanje</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Evidentirani radovi na košnici {hiveQuery.data.label}.
        </Text>
        <Details maintenance={maintenance} />
      </ScrollView>
    </Screen>
  );
}

function Details({ maintenance }: { maintenance: HiveMaintenanceDetails }) {
  const rows = [
    {
      label: 'Vrsta održavanja',
      value: getMaintenanceTypeLabel(maintenance.maintenanceType),
    },
    { label: 'Datum i vreme', value: formatDateTime(maintenance.performedAt) },
    ...(maintenance.costAmount !== null && maintenance.currencyCode
      ? [
          {
            label: 'Trošak',
            value: `${new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 2 }).format(maintenance.costAmount)} ${maintenance.currencyCode}`,
          },
        ]
      : []),
    ...(maintenance.serviceProvider
      ? [{ label: 'Izvršilac radova', value: maintenance.serviceProvider }]
      : []),
  ];
  return (
    <>
      <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Podaci o održavanju</Text>
      <View className="rounded-3xl border border-border bg-surface px-5 py-1">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={`flex-row items-start justify-between gap-6 py-3 ${index === rows.length - 1 ? '' : 'border-b border-border'}`}
          >
            <Text className="flex-1 text-sm text-muted">{row.label}</Text>
            <Text className="flex-1 text-right text-sm font-semibold text-foreground">
              {row.value}
            </Text>
          </View>
        ))}
      </View>
      {maintenance.notes?.trim() && (
        <>
          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Napomena</Text>
          <View className="rounded-3xl border border-border bg-surface px-5 py-4">
            <Text className="text-base leading-6 text-foreground">{maintenance.notes.trim()}</Text>
          </View>
        </>
      )}
      {maintenance.imageUrl && (
        <>
          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Fotografija</Text>
          <View className="h-64 overflow-hidden rounded-3xl border border-border bg-surface">
            <Image
              source={`${environment.apiUrl}${maintenance.imageUrl}`}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
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
function StateScreen({ label, retry }: { label: string; retry?: () => void }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-8">
        {!retry && <ActivityIndicator size="large" color={colors.primary} />}
        <Text className="mt-3 text-center text-base font-semibold text-muted">{label}</Text>
        {retry && (
          <Pressable
            onPress={retry}
            className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
          >
            <Text className="font-bold text-background">Pokušaj ponovo</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
