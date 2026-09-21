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
  useApiary,
} from '@/features/apiaries/hooks/use-apiary';
import {
  useApiaryRelocations,
} from '@/features/relocations/hooks/use-apiary-relocations';
import type {
  ApiaryRelocationHistoryItem,
} from '@/features/relocations/types/relocation-history';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';
import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  Screen,
} from '@/shared/components/screen/screen';
import {
  colors,
} from '@/shared/theme/colors';

type RelocationHistoryScreenProps = {
  apiaryId: string;
};

const transportMethodLabels = {
  trailer: 'Prikolica',
  truck: 'Kamion',
  van: 'Kombi',
  other: 'Drugo',
} as const;

function formatTimelineDate(
  occurredAtUtc: string,
) {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(occurredAtUtc));
}

function relocationLabel(
  relocation: ApiaryRelocationHistoryItem,
) {
  return relocation.kind === 'wholeApiary'
    ? 'Ceo pčelinjak'
    : `${relocation.hiveCount ?? 0} košnica`;
}

export function RelocationHistoryScreen({
  apiaryId,
}: RelocationHistoryScreenProps) {
  const {
    openDrawer,
  } = useAppDrawer();
  const apiaryQuery = useApiary(apiaryId);
  const relocationsQuery = useApiaryRelocations(apiaryId);
  const relocations = relocationsQuery.data?.pages.flatMap(
    (page) => page.items,
  ) ?? [];

  const isLoading =
    apiaryQuery.isLoading ||
    relocationsQuery.isLoading;
  const isError =
    apiaryQuery.isError ||
    relocationsQuery.isError;

  return (
    <Screen
      header={<AppHeader onMenuPress={openDrawer} />}
      contextualActionBar={
        <ContextualActionBar
          primaryAction={{
            key: 'create-relocation',
            label: 'Nova selidba',
            icon: 'add',
            accessibilityLabel:
              'Kreiraj novu selidbu pčelinjaka',
            onPress: () => {
              router.push({
                pathname:
                  '/apiaries/[apiaryId]/relocations/create',
                params: { apiaryId },
              });
            },
          }}
        />
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : isError || !apiaryQuery.data ? (
        <LoadError
          onRetry={() => {
            void Promise.all([
              apiaryQuery.refetch(),
              relocationsQuery.refetch(),
            ]);
          }}
        />
      ) : (
        <FlatList
          data={relocations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
            flexGrow:
              relocations.length === 0 ? 1 : undefined,
          }}
          ListHeaderComponent={
            <View className="mb-7">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Nazad na pčelinjak"
                onPress={() => {
                  router.back();
                }}
                className="self-start py-2"
              >
                <Text className="text-sm font-semibold text-primary">
                  ← Pčelinjak
                </Text>
              </Pressable>
              <Text className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">
                Pčelinjak
              </Text>
              <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {apiaryQuery.data.name}
              </Text>
              <Text className="mt-8 text-xl font-bold text-foreground">
                Istorija selidbi
              </Text>
              <Text className="mt-1 text-sm text-muted">
                Evidentirane selidbe, od najnovije.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
              <Ionicons
                name="swap-horizontal-outline"
                size={30}
                color={colors.primary}
              />
              <Text className="mt-3 text-center text-base font-semibold text-foreground">
                Još nema evidentiranih selidbi.
              </Text>
              <Text className="mt-2 text-center text-sm text-muted">
                Novu selidbu možete dodati centralnim dugmetom.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <RelocationTimelineItem
              relocation={item}
              apiaryId={apiaryId}
              isFirst={index === 0}
              isLast={index === relocations.length - 1}
            />
          )}
          onEndReached={() => {
            if (
              relocationsQuery.hasNextPage &&
              !relocationsQuery.isFetchingNextPage
            ) {
              void relocationsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            relocationsQuery.isFetchingNextPage ? (
              <ActivityIndicator
                className="my-5"
                color={colors.primary}
              />
            ) : null
          }
        />
      )}
    </Screen>
  );
}

function RelocationTimelineItem({
  relocation,
  apiaryId,
  isFirst,
  isLast,
}: {
  relocation: ApiaryRelocationHistoryItem;
  apiaryId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <View className="flex-row">
      <View className="w-16 items-end justify-center pr-3">
        <Text className="text-right text-xs font-bold text-foreground">
          {formatTimelineDate(relocation.occurredAtUtc)}
        </Text>
      </View>
      <View className="relative w-7 items-center justify-center">
        {!isFirst && (
          <View
            className="absolute top-0 w-px bg-border"
            style={{ bottom: '50%' }}
          />
        )}
        {!isLast && (
          <View
            className="absolute bottom-0 w-px bg-border"
            style={{ top: '50%' }}
          />
        )}
        <View className="z-10 h-4 w-4 rounded-full border-4 border-background bg-primary" />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Otvori selidbu: ${relocation.originLocationName} do ${relocation.destinationLocationName}`}
        onPress={() => {
          router.push({
            pathname:
              '/apiaries/[apiaryId]/relocations/[relocationId]',
            params: {
              apiaryId,
              relocationId: relocation.id,
            },
          });
        }}
        className="mb-5 flex-1 rounded-3xl border border-border bg-surface px-4 py-4"
        style={({ pressed }) => ({
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <View className="flex-row items-start">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons
              name="swap-horizontal-outline"
              size={21}
              color={colors.primary}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-foreground">
              {relocation.originLocationName} → {relocation.destinationLocationName}
            </Text>
            <Text className="mt-1 text-sm text-muted">
              {relocationLabel(relocation)}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.muted}
          />
        </View>
        <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2">
          <TimelineDetail
            icon="car-outline"
            label={transportMethodLabels[relocation.transportMethod]}
          />
          {relocation.distanceKm !== null && (
            <TimelineDetail
              icon="navigate-outline"
              label={`${relocation.distanceKm} km`}
            />
          )}
        </View>
        {relocation.notes && (
          <Text className="mt-3 text-sm leading-5 text-muted">
            {relocation.notes}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function TimelineDetail({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons
        name={icon}
        size={15}
        color={colors.muted}
      />
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">
        Učitavanje selidbi...
      </Text>
    </View>
  );
}

function LoadError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati selidbe.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
      >
        <Text className="font-bold text-background">
          Pokušaj ponovo
        </Text>
      </Pressable>
    </View>
  );
}
