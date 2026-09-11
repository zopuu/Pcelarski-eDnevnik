import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ActionOverflowSheet } from '@/shared/components/contextual-action-bar/action-overflow-sheet';
import { ContextualActionBar } from '@/shared/components/contextual-action-bar/contextual-action-bar';
import type { ContextualAction } from '@/shared/components/contextual-action-bar/types';
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
import { useFinalizeHoneyBatch } from '../hooks/use-finalize-honey-batch';
import { useHoneyBatch } from '../hooks/use-honey-batch';
import {
  formatAmount,
  formatBatchIdentity,
  formatHarvestDate,
  formatPeriod,
  getBatchStatusLabel,
  getDeterminationMethodLabel,
  getForageLabel,
  hasDistinctBatchName,
} from '../utils/harvest-format';

export function HoneyBatchDetailsScreen({ batchId }: { batchId: string }) {
  const { openDrawer } = useAppDrawer();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const query = useHoneyBatch(batchId);
  const finalizeHoneyBatchMutation = useFinalizeHoneyBatch();
  const header = <AppHeader onMenuPress={openDrawer} />;

  if (query.isLoading) return <Screen header={header}><HarvestLoadingState label="Učitavanje serije meda..." /></Screen>;
  if (query.isError || !query.data) {
    return <Screen header={header}><HarvestErrorState message="Seriju meda nije moguće učitati." onRetry={() => void query.refetch()} /></Screen>;
  }

  const batch = query.data;
  const isOpen = batch.status.toLocaleLowerCase() === 'open';
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
        {batch.currentComposition ? (
          <View className="rounded-3xl border border-border bg-surface px-4 py-4">
            {batch.currentComposition.items.map((item, index) => (
              <View key={item.id} className={index > 0 ? 'mt-4 border-t border-border pt-4' : ''}>
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 text-base font-semibold text-foreground">{getForageLabel(item.forageType)}</Text>
                  <Text className="text-lg font-bold text-primary">{item.percentage}%</Text>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full bg-surface-warm">
                  <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }} />
                </View>
                {item.notes && <Text className="mt-2 text-sm text-muted">{item.notes}</Text>}
              </View>
            ))}
            <Text className="mt-4 border-t border-border pt-4 text-xs text-muted">
              Određeno {new Intl.DateTimeFormat('sr-Latn-RS', { dateStyle: 'medium' }).format(new Date(batch.currentComposition.determinedAt))} · {getDeterminationMethodLabel(batch.currentComposition.determinationMethod)}
            </Text>
          </View>
        ) : (
          <View className="items-center rounded-3xl border border-border bg-surface px-6 py-8">
            <Ionicons name="flask-outline" size={32} color={colors.muted} />
            <Text className="mt-3 text-center text-base font-semibold text-foreground">Sastav meda još nije određen</Text>
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
