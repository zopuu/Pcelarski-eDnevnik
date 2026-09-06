import Ionicons
  from '@react-native-vector-icons/ionicons';
import {
  router,
} from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  useHive,
} from '@/features/hives/hooks/use-hive';
import {
  HiveHeaderIllustration,
} from '@/features/hives/components/hive-header-illustration';
import {
  useHiveRelocations,
} from '@/features/relocations/hooks/use-hive-relocations';
import type {
  ApiaryRelocationHistoryItem,
} from '@/features/relocations/types/relocation-history';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  Screen,
} from '@/shared/components/screen/screen';
import {
  colors,
} from '@/shared/theme/colors';

type HiveRelocationHistoryScreenProps = {
  hiveId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function HiveRelocationHistoryScreen({
  hiveId,
}: HiveRelocationHistoryScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const relocationsQuery = useHiveRelocations(hiveId);
  const relocations = relocationsQuery.data?.pages.flatMap(
    (page) => page.items,
  ) ?? [];

  if (hiveQuery.isLoading || relocationsQuery.isLoading) {
    return <StateScreen label="Učitavanje selidbi..." />;
  }

  if (hiveQuery.isError || relocationsQuery.isError || !hiveQuery.data) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <ErrorState
          onRetry={() => {
            void Promise.all([
              hiveQuery.refetch(),
              relocationsQuery.refetch(),
            ]);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <FlatList
        data={relocations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
          flexGrow: relocations.length === 0 ? 1 : undefined,
        }}
        ListHeaderComponent={
          <View className="mb-7">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nazad na košnicu"
              onPress={() => router.back()}
              className="self-start py-2"
            >
              <Text className="text-sm font-semibold text-primary">← Košnica</Text>
            </Pressable>
            <View className="mt-3 flex-row items-start">
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase tracking-widest text-muted">Košnica</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">{hiveQuery.data.label}</Text>
              </View>
              <HiveHeaderIllustration
                colorHex={hiveQuery.data.colorHex}
                size={76}
                accessible={false}
              />
            </View>
            <Text className="mt-8 text-xl font-bold text-foreground">Istorija selidbi</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
            <Ionicons name="swap-horizontal-outline" size={30} color={colors.primary} />
            <Text className="mt-3 text-center text-base font-semibold text-foreground">Još nema evidentiranih selidbi.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <HiveRelocationTimelineItem
            hiveId={hiveId}
            relocation={item}
            isFirst={index === 0}
            isLast={index === relocations.length - 1}
          />
        )}
        onEndReached={() => {
          if (relocationsQuery.hasNextPage && !relocationsQuery.isFetchingNextPage) {
            void relocationsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={relocationsQuery.isFetchingNextPage ? <ActivityIndicator className="my-5" color={colors.primary} /> : null}
      />
    </Screen>
  );
}

function HiveRelocationTimelineItem({
  hiveId,
  relocation,
  isFirst,
  isLast,
}: {
  hiveId: string;
  relocation: ApiaryRelocationHistoryItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const relocationLabel = relocation.kind === 'wholeApiary'
    ? 'Ceo pčelinjak'
    : `${relocation.hiveCount ?? 0} košnica`;

  return (
    <View className="flex-row">
      <View className="w-16 items-end justify-center pr-3"><Text className="text-right text-xs font-bold text-foreground">{formatDate(relocation.occurredAtUtc)}</Text></View>
      <View className="relative w-7 items-center justify-center">
        {!isFirst && <View className="absolute top-0 w-px bg-border" style={{ bottom: '50%' }} />}
        {!isLast && <View className="absolute bottom-0 w-px bg-border" style={{ top: '50%' }} />}
        <View className="z-10 h-4 w-4 rounded-full border-4 border-background bg-primary" />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Otvori selidbu: ${relocation.originLocationName} do ${relocation.destinationLocationName}`}
        onPress={() => {
          router.push({
            pathname: '/hives/[hiveId]/relocations/[relocationId]',
            params: { hiveId, relocationId: relocation.id },
          });
        }}
        className="mb-5 flex-1 rounded-3xl border border-border bg-surface px-4 py-4"
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <View className="flex-row items-start">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"><Ionicons name="swap-horizontal-outline" size={21} color={colors.primary} /></View>
          <View className="ml-3 flex-1"><Text className="text-base font-bold text-foreground">{relocation.originLocationName} → {relocation.destinationLocationName}</Text><Text className="mt-1 text-sm text-muted">{relocationLabel}</Text></View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </View>
      </Pressable>
    </View>
  );
}

function StateScreen({ label }: { label: string }) {
  return <Screen><View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={colors.primary} /><Text className="mt-3 text-muted">{label}</Text></View></Screen>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <View className="flex-1 items-center justify-center px-8"><Text className="text-center text-base font-semibold text-error">Nije moguće učitati selidbe.</Text><Pressable accessibilityRole="button" onPress={onRetry} className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"><Text className="font-bold text-background">Pokušaj ponovo</Text></Pressable></View>;
}
