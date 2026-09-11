import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { ActionOverflowSheet } from '@/shared/components/contextual-action-bar/action-overflow-sheet';
import { ContextualActionBar } from '@/shared/components/contextual-action-bar/contextual-action-bar';
import type { ContextualAction } from '@/shared/components/contextual-action-bar/types';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { HarvestSourceList } from '../components/harvest-source-list';
import { CompositionCalculationError } from '../components/composition-calculation-error';
import { HoneyBatchCompositionCard } from '../components/honey-batch-composition-card';
import {
  DetailMetric,
  HarvestErrorState,
  HarvestLoadingState,
  SectionTitle,
} from '../components/harvest-screen-states';
import { useFinalizeHoneyBatch } from '../hooks/use-finalize-honey-batch';
import { useCalculateHoneyBatchComposition } from '../hooks/use-calculate-honey-batch-composition';
import { useHoneyBatch } from '../hooks/use-honey-batch';
import {
  formatAmount,
  formatBatchIdentity,
  formatHarvestDate,
  formatPeriod,
  getBatchStatusLabel,
  hasDistinctBatchName,
} from '../utils/harvest-format';
import type { CompositionCalculationIssue } from '../types/harvest';

export function HoneyBatchDetailsScreen({ batchId }: { batchId: string }) {
  const { openDrawer } = useAppDrawer();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [calculationIssues, setCalculationIssues] = useState<CompositionCalculationIssue[] | null>(null);
  const query = useHoneyBatch(batchId);
  const finalizeHoneyBatchMutation = useFinalizeHoneyBatch();
  const calculateCompositionMutation = useCalculateHoneyBatchComposition();
  const header = <AppHeader onMenuPress={openDrawer} />;

  if (query.isLoading) return <Screen header={header}><HarvestLoadingState label="Učitavanje serije meda..." /></Screen>;
  if (query.isError || !query.data) {
    return <Screen header={header}><HarvestErrorState message="Seriju meda nije moguće učitati." onRetry={() => void query.refetch()} /></Screen>;
  }

  const batch = query.data;
  const isOpen = batch.status.toLocaleLowerCase() === 'open';
  const openManualComposition = () => router.push({ pathname: '/honey-batches/[batchId]/composition/manual', params: { batchId: batch.id } } as never);
  const openLaboratoryComposition = () => router.push({ pathname: '/honey-batches/[batchId]/composition/laboratory', params: { batchId: batch.id } } as never);
  const handleCalculateComposition = () => {
    Alert.alert(
      'Izračunaj sastav meda?',
      'Sistem će proceniti sastav na osnovu porekla meda, perioda boravka nastavaka i evidentiranih profila paše.\n\nProračun predstavlja procenu, ne laboratorijsku analizu.',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Izračunaj',
          onPress: () => {
            setCalculationIssues(null);
            void calculateCompositionMutation.mutateAsync(batch.id)
              .then(() => Alert.alert('Sastav meda je izračunat.'))
              .catch(async (error) => {
                if (error instanceof ApiError && error.status === 409) {
                  await query.refetch();
                  Alert.alert('Sastav je u međuvremenu već određen.');
                  return;
                }
                if (error instanceof ApiError && error.status === 422 && error.problem?.code === 'honey_batch_composition.cannot_calculate') {
                  const issues = getCalculationIssues(error.problem.issues);
                  setCalculationIssues(issues);
                  Alert.alert('Sastav nije moguće izračunati', 'Nema dovoljno pouzdanih podataka za automatski proračun sastava.');
                  return;
                }
                if (error instanceof ApiError && error.status === 404) {
                  Alert.alert('Serija meda nije pronađena', 'Serija meda nije pronađena ili joj više nemate pristup.');
                  return;
                }
                Alert.alert('Proračun nije uspeo', 'Sastav meda nije moguće izračunati. Pokušajte ponovo.');
              });
          },
        },
      ],
    );
  };
  const handleFinalizePress = () => {
    Alert.alert(
      'Završi seriju meda?',
      `Nakon završavanja nova vrcanja se više neće automatski dodavati ovoj seriji.\n\n${formatBatchIdentity(batch.name, batch.batchCode)}\nUkupno: ${formatAmount(batch.totalAmount, batch.unit)}\nBroj vrcanja: ${batch.harvestCount}\nUkupno ramova: ${batch.totalHarvestedFrameCount}\nPeriod porekla meda: ${formatPeriod(batch.periodStartedOn, batch.periodEndedOn)}`,
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Završi seriju',
          onPress: () => {
            void finalizeHoneyBatchMutation
              .mutateAsync(batch.id)
              .then(() => {
                Alert.alert('Serija završena', 'Serija meda je završena.');
              })
              .catch(() => {
                Alert.alert(
                  'Završavanje nije uspelo',
                  'Seriju meda nije moguće završiti. Pokušajte ponovo.',
                );
              });
          },
        },
      ],
    );
  };

  const moreActions: ContextualAction[] = isOpen
    ? [
        {
          key: 'finalize-batch',
          label: 'Završi seriju',
          icon: 'checkmark-circle-outline',
          accessibilityLabel: 'Završi seriju meda',
          onPress: handleFinalizePress,
          loading: finalizeHoneyBatchMutation.isPending,
        },
      ]
    : [];

  return (
    <>
      <Screen
        header={header}
        contextualActionBar={
          <ContextualActionBar
            primaryAction={{
              key: 'create-harvest',
              label: 'Vrcanje',
              icon: 'water-outline',
              accessibilityLabel: 'Evidentiraj novo vrcanje',
              onPress: () => router.push('/harvests/create' as never),
            }}
            rightActions={[
              {
                key: 'more',
                label: 'Više',
                icon: 'ellipsis-horizontal-outline',
                accessibilityLabel: 'Prikaži više opcija za seriju meda',
                onPress: () => setIsMoreOpen(true),
                hidden: !isOpen,
              },
            ]}
          />
        }
      >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Vrati se na serije meda" onPress={() => router.back()} className="mb-3 mt-3 self-start py-2">
          <Text className="text-sm font-semibold text-primary">← Serije meda</Text>
        </Pressable>

        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            {hasDistinctBatchName(batch.name, batch.batchCode) && (
              <Text className="text-xs font-bold uppercase tracking-widest text-muted">{batch.batchCode}</Text>
            )}
            <Text className={`${hasDistinctBatchName(batch.name, batch.batchCode) ? 'mt-1 ' : ''}text-3xl font-bold tracking-tight text-foreground`}>
              {hasDistinctBatchName(batch.name, batch.batchCode) ? batch.name : batch.batchCode}
            </Text>
          </View>
          <View className={`rounded-full px-3 py-1.5 ${isOpen ? 'bg-success/10' : 'bg-surface-warm'}`}>
            <Text className={`text-xs font-bold ${isOpen ? 'text-success' : 'text-muted'}`}>{getBatchStatusLabel(batch.status)}</Text>
          </View>
        </View>
        <Text className="mt-4 text-3xl font-bold text-primary">{formatAmount(batch.totalAmount, batch.unit)}</Text>

        <View className="mt-6 flex-row flex-wrap gap-3 rounded-3xl border border-border bg-surface p-4">
          <DetailMetric label="Period porekla meda" value={formatPeriod(batch.periodStartedOn, batch.periodEndedOn)} />
          <DetailMetric label="Broj vrcanja" value={String(batch.harvestCount)} />
          <DetailMetric label="Ukupno ramova" value={String(batch.totalHarvestedFrameCount)} />
          <DetailMetric label="Nastavaka izvora" value={String(batch.sourceSuperCount)} />
        </View>

        {batch.notes && (
          <>
            <SectionTitle>Napomena</SectionTitle>
            <View className="rounded-3xl border border-border bg-surface px-4 py-4"><Text className="text-base leading-6 text-foreground">{batch.notes}</Text></View>
          </>
        )}

        <SectionTitle>Vrcanja u seriji</SectionTitle>
        <View className="overflow-hidden rounded-3xl border border-border bg-surface">
          {batch.harvests.map((harvest, index) => (
            <Pressable
              key={harvest.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/harvests/[harvestId]', params: { harvestId: harvest.id } } as never)}
              className={`min-h-16 flex-row items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-border' : ''}`}
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
            >
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Ionicons name="water-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-foreground">{formatHarvestDate(harvest.harvestedOn)}</Text>
                <Text className="mt-0.5 text-sm text-muted">{harvest.harvestedFrameCount} ramova · {harvest.superCount} nastavaka</Text>
              </View>
              <Text className="font-bold text-foreground">{formatAmount(harvest.honeyAmount, harvest.unit)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <SectionTitle>Sastav meda</SectionTitle>
        {isOpen ? (
          <View className="rounded-3xl border border-border bg-surface px-5 py-5">
            <Text className="text-base font-semibold text-foreground">Sastav se može odrediti nakon završavanja serije.</Text>
          </View>
        ) : batch.currentComposition ? (
          <>
            <HoneyBatchCompositionCard composition={batch.currentComposition} />
            <View className="mt-3 gap-3">
              {batch.canManuallyDetermineComposition && <Pressable accessibilityRole="button" onPress={openManualComposition} className="min-h-12 items-center justify-center rounded-2xl border border-primary bg-surface px-4"><Text className="font-bold text-primary">Ručno izmeni sastav</Text></Pressable>}
              {batch.canLaboratoryDetermineComposition && <Pressable accessibilityRole="button" onPress={openLaboratoryComposition} className="min-h-12 items-center justify-center rounded-2xl border border-border bg-surface px-4"><Text className="font-bold text-foreground">Unesi laboratorijski nalaz</Text></Pressable>}
            </View>
          </>
        ) : calculationIssues ? (
          <CompositionCalculationError issues={calculationIssues} onManual={openManualComposition} onLaboratory={openLaboratoryComposition} />
        ) : (
          <View className="items-center rounded-3xl border border-border bg-surface px-6 py-8">
            <Ionicons name="flask-outline" size={32} color={colors.muted} />
            <Text className="mt-3 text-center text-base font-semibold text-foreground">Sastav još nije određen.</Text>
            <Text className="mt-2 text-center text-sm leading-5 text-muted">Možete pokušati automatski proračun na osnovu istorije paše i porekla meda, uneti sastav ručno ili evidentirati laboratorijski nalaz.</Text>
            <View className="mt-5 w-full gap-3">
              {batch.canCalculateComposition && <Pressable accessibilityRole="button" disabled={calculateCompositionMutation.isPending} onPress={handleCalculateComposition} className={`min-h-12 items-center justify-center rounded-2xl bg-primary px-4 ${calculateCompositionMutation.isPending ? 'opacity-60' : ''}`}><Text className="font-bold text-background">{calculateCompositionMutation.isPending ? 'Izračunavanje...' : 'Izračunaj sastav'}</Text></Pressable>}
              {batch.canManuallyDetermineComposition && <Pressable accessibilityRole="button" onPress={openManualComposition} className="min-h-12 items-center justify-center rounded-2xl border border-primary bg-surface px-4"><Text className="font-bold text-primary">Unesi ručno</Text></Pressable>}
              {batch.canLaboratoryDetermineComposition && <Pressable accessibilityRole="button" onPress={openLaboratoryComposition} className="min-h-12 items-center justify-center rounded-2xl border border-border bg-surface px-4"><Text className="font-bold text-foreground">Laboratorijski nalaz</Text></Pressable>}
            </View>
          </View>
        )}

        <SectionTitle>Izvori i lokacije</SectionTitle>
        <HarvestSourceList sources={batch.sources} />

        {batch.sourceIssues.length > 0 && (
          <View className="mt-6 rounded-3xl border border-warning/30 bg-surface-warm px-4 py-4">
            <Text className="font-bold text-foreground">Nepotpuni podaci o izvorima</Text>
            <Text className="mt-1 text-sm leading-5 text-muted">Za {batch.sourceIssues.length} izvora nije moguće prikazati celu istoriju lokacija.</Text>
          </View>
        )}
      </ScrollView>
      </Screen>

      <ActionOverflowSheet
        visible={isMoreOpen && isOpen}
        title="Serija meda"
        actions={moreActions}
        onClose={() => setIsMoreOpen(false)}
      />
    </>
  );
}

function getCalculationIssues(value: unknown): CompositionCalculationIssue[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null || typeof (item as Record<string, unknown>).code !== 'string') return [];
    const issue = item as Record<string, unknown>;
    return [{
      code: issue.code as string,
      message: typeof issue.message === 'string' ? issue.message : undefined,
      hiveSuperStayId: typeof issue.hiveSuperStayId === 'string' ? issue.hiveSuperStayId : undefined,
      apiaryStayId: typeof issue.apiaryStayId === 'string' ? issue.apiaryStayId : undefined,
      year: typeof issue.year === 'number' ? issue.year : undefined,
    }];
  });
}
