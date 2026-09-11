import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ContextualActionBar } from '@/shared/components/contextual-action-bar/contextual-action-bar';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { HarvestCard } from '../components/harvest-card';
import { HoneyBatchCard } from '../components/honey-batch-card';
import { HarvestErrorState, HarvestLoadingState } from '../components/harvest-screen-states';
import { useHarvests } from '../hooks/use-harvests';
import { useHoneyBatches } from '../hooks/use-honey-batches';

type HoneyTab = 'harvests' | 'batches';

export function HarvestsScreen() {
  const { openDrawer } = useAppDrawer();
  const [tab, setTab] = useState<HoneyTab>('harvests');

  return (
    <Screen
      header={<AppHeader onMenuPress={openDrawer} />}
      contextualActionBar={
        <ContextualActionBar
          primaryAction={{
            key: 'create-harvest',
            label: 'Vrcanje',
            icon: 'water-outline',
            accessibilityLabel: 'Evidentiraj novo vrcanje',
            onPress: () => router.push('/harvests/create' as never),
          }}
        />
      }
    >
      <View className="px-4 pb-3 pt-5">
        <Text className="text-2xl font-bold tracking-tight text-foreground">Med</Text>
        <Text className="mt-1 text-sm text-muted">Vrcanja i serije meda na jednom mestu.</Text>
        <SegmentedControl value={tab} onChange={setTab} />
      </View>
      {tab === 'harvests' ? <HarvestHistory /> : <HoneyBatchList />}
    </Screen>
  );
}

function SegmentedControl({ value, onChange }: { value: HoneyTab; onChange: (value: HoneyTab) => void }) {
  return (
    <View accessibilityRole="tablist" className="mt-5 flex-row rounded-2xl bg-surface-warm p-1">
      {([
        { value: 'harvests' as const, label: 'Vrcanja', icon: 'water-outline' as const },
        { value: 'batches' as const, label: 'Serije meda', icon: 'layers-outline' as const },
      ]).map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${selected ? 'bg-surface' : ''}`}
          >
            <Ionicons name={option.icon} size={18} color={selected ? colors.primary : colors.muted} />
            <Text className={`font-bold ${selected ? 'text-foreground' : 'text-muted'}`}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function HarvestHistory() {
  const query = useHarvests();
  const items = query.data?.pages.flatMap((response) => response.page.items) ?? [];

  if (query.isLoading) return <HarvestLoadingState label="Učitavanje vrcanja..." />;
  if (query.isError) return <HarvestErrorState message="Nije moguće učitati vrcanja." onRetry={() => void query.refetch()} />;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: items.length === 0 ? 1 : undefined }}
      ItemSeparatorComponent={() => <View className="h-4" />}
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
      }}
      onEndReachedThreshold={0.35}
      ListEmptyComponent={<EmptyState icon="water-outline" title="Još nema vrcanja" message="Evidentirajte prvo vrcanje pomoću centralnog dugmeta." />}
      ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator className="my-5" color={colors.primary} /> : null}
      renderItem={({ item }) => (
        <HarvestCard
          harvest={item}
          onPress={() => router.push({ pathname: '/harvests/[harvestId]', params: { harvestId: item.id } } as never)}
        />
      )}
    />
  );
}

function HoneyBatchList() {
  const query = useHoneyBatches();
  const items = query.data?.pages.flatMap((response) => response.page.items) ?? [];

  if (query.isLoading) return <HarvestLoadingState label="Učitavanje serija meda..." />;
  if (query.isError) return <HarvestErrorState message="Nije moguće učitati serije meda." onRetry={() => void query.refetch()} />;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: items.length === 0 ? 1 : undefined }}
      ItemSeparatorComponent={() => <View className="h-4" />}
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
      }}
      onEndReachedThreshold={0.35}
      ListEmptyComponent={<EmptyState icon="layers-outline" title="Još nema serija meda" message="Serija će se pojaviti nakon evidentiranog vrcanja." />}
      ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator className="my-5" color={colors.primary} /> : null}
      renderItem={({ item }) => (
        <HoneyBatchCard
          batch={item}
          onPress={() => router.push({ pathname: '/honey-batches/[batchId]', params: { batchId: item.id } } as never)}
        />
      )}
    />
  );
}

function EmptyState({ icon, title, message }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; message: string }) {
  return (
    <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text className="mt-5 text-center text-xl font-bold text-foreground">{title}</Text>
      <Text className="mt-2 text-center text-base leading-6 text-muted">{message}</Text>
    </View>
  );
}
