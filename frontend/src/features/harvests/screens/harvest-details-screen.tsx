import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { HarvestSourceList } from '../components/harvest-source-list';
import {
  DetailMetric,
  HarvestErrorState,
  HarvestLoadingState,
  SectionTitle,
} from '../components/harvest-screen-states';
import { useHarvest } from '../hooks/use-harvest';
import {
  formatAmount,
  formatHarvestDate,
  formatPeriod,
  getBatchStatusLabel,
} from '../utils/harvest-format';

export function HarvestDetailsScreen({ harvestId }: { harvestId: string }) {
  const { openDrawer } = useAppDrawer();
  const query = useHarvest(harvestId);
  const header = <AppHeader onMenuPress={openDrawer} />;

  if (query.isLoading) return <Screen header={header}><HarvestLoadingState label="Učitavanje vrcanja..." /></Screen>;
  if (query.isError || !query.data) {
    return <Screen header={header}><HarvestErrorState message="Vrcanje nije moguće učitati." onRetry={() => void query.refetch()} /></Screen>;
  }

  const harvest = query.data;
  return (
    <Screen header={header}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <BackButton />
        <Text className="text-xs font-bold uppercase tracking-widest text-muted">Vrcanje</Text>
        <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatAmount(harvest.honeyAmount, harvest.unit)}
        </Text>
        <Text className="mt-2 text-sm text-muted">{formatHarvestDate(harvest.harvestedOn)}</Text>

        <View className="mt-6 flex-row flex-wrap gap-3 rounded-3xl border border-border bg-surface p-4">
          <DetailMetric label="Izvrcano ramova" value={String(harvest.harvestedFrameCount)} />
          <DetailMetric label="Broj nastavaka" value={String(harvest.superCount)} />
          <DetailMetric label="Period izvora" value={formatPeriod(harvest.sourcePeriodStartedOn, harvest.sourcePeriodEndedOn)} />
        </View>

        <SectionTitle>Serija meda</SectionTitle>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Otvori seriju ${harvest.batch.batchCode}`}
          onPress={() => router.push({ pathname: '/honey-batches/[batchId]', params: { batchId: harvest.batch.id } } as never)}
          className="flex-row items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons name="layers-outline" size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">{harvest.batch.name}</Text>
            <Text className="mt-1 text-sm text-muted">{harvest.batch.batchCode} · {getBatchStatusLabel(harvest.batch.status)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

        {harvest.notes && (
          <>
            <SectionTitle>Napomena</SectionTitle>
            <View className="rounded-3xl border border-border bg-surface px-4 py-4">
              <Text className="text-base leading-6 text-foreground">{harvest.notes}</Text>
            </View>
          </>
        )}

        <SectionTitle>Izvori meda</SectionTitle>
        <HarvestSourceList sources={harvest.sources} />

        {harvest.sourceIssues.length > 0 && (
          <View className="mt-6 rounded-3xl border border-warning/30 bg-surface-warm px-4 py-4">
            <Text className="font-bold text-foreground">Nepotpuni podaci o izvorima</Text>
            <Text className="mt-1 text-sm leading-5 text-muted">
              Za {harvest.sourceIssues.length} izvora nije moguće prikazati celu istoriju lokacija.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function BackButton() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Vrati se na vrcanja" onPress={() => router.back()} className="mb-3 mt-3 self-start py-2">
      <Text className="text-sm font-semibold text-primary">← Vrcanja</Text>
    </Pressable>
  );
}
