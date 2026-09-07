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
} from '../hooks/use-apiary';
import {
  useApiaryStayHistory,
} from '../hooks/use-apiary-stay-history';
import type {
  ApiaryStayHistoryItem,
  HiveEntranceOrientation,
} from '../types/apiary-stay';

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

type ApiaryStayHistoryScreenProps = {
  apiaryId: string;
};

const orientationLabels: Record<
  HiveEntranceOrientation,
  string
> = {
  north: 'Sever',
  northEast: 'Severoistok',
  east: 'Istok',
  southEast: 'Jugoistok',
  south: 'Jug',
  southWest: 'Jugozapad',
  west: 'Zapad',
  northWest: 'Severozapad',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDays(daysSpent: number) {
  return daysSpent === 1
    ? '1 dan'
    : `${daysSpent} dana`;
}

export function ApiaryStayHistoryScreen({
  apiaryId,
}: ApiaryStayHistoryScreenProps) {
  const { openDrawer } = useAppDrawer();
  const apiaryQuery = useApiary(apiaryId);
  const staysQuery = useApiaryStayHistory(apiaryId);
  const stays = staysQuery.data?.pages.flatMap(
    (page) => page.items,
  ) ?? [];
  const isLoading = apiaryQuery.isLoading || staysQuery.isLoading;
  const isError = apiaryQuery.isError || staysQuery.isError;

  if (isLoading) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <LoadingState />
      </Screen>
    );
  }

  if (isError || !apiaryQuery.data) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <LoadError
          onRetry={() => {
            void Promise.all([
              apiaryQuery.refetch(),
              staysQuery.refetch(),
            ]);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <FlatList
        data={stays}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
          flexGrow: stays.length === 0 ? 1 : undefined,
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
              {apiaryQuery.data.name?.trim() ||
                'Pčelinjak bez naziva'}
            </Text>
            <Text className="mt-8 text-xl font-bold text-foreground">
              Istorija boravaka
            </Text>
            <Text className="mt-1 text-sm text-muted">
              Lokacije na kojima je pčelinjak boravio, od najnovije.
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <ApiaryStayTimelineItem
            stay={item}
            isFirst={index === 0}
            isLast={index === stays.length - 1}
          />
        )}
        onEndReached={() => {
          if (
            staysQuery.hasNextPage &&
            !staysQuery.isFetchingNextPage
          ) {
            void staysQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          staysQuery.isFetchingNextPage ? (
            <ActivityIndicator
              className="my-5"
              color={colors.primary}
            />
          ) : null
        }
      />
    </Screen>
  );
}

function ApiaryStayTimelineItem({
  stay,
  isFirst,
  isLast,
}: {
  stay: ApiaryStayHistoryItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <View className="flex-row">
      <View className="w-20 items-end justify-center pr-3">
        <TimelineDate value={stay.startedAtUtc} />
        <View className="my-2 h-px w-4 bg-border" />
        {stay.endedAtUtc ? (
          <TimelineDate value={stay.endedAtUtc} muted />
        ) : (
          <Text className="text-right text-xs font-semibold text-primary">
            U toku
          </Text>
        )}
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
        <View className={`z-10 h-4 w-4 rounded-full border-4 border-background ${
          stay.isActive ? 'bg-primary' : 'bg-muted'
        }`} />
      </View>

      <View className="mb-5 flex-1 rounded-3xl border border-border bg-surface px-4 py-4">
        <View className="flex-row items-start">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons
              name="location-outline"
              size={21}
              color={colors.primary}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-foreground">
              {stay.locationName?.trim() ||
                'Lokacija bez naziva'}
            </Text>
            {stay.isActive && (
              <View className="mt-1 self-start rounded-full bg-success/10 px-2 py-1">
                <Text className="text-xs font-bold text-success">
                  Trenutno aktivan
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mt-4 gap-3 border-t border-border pt-4">
          <Detail label="Početak" value={formatDate(stay.startedAtUtc)} />
          <Detail
            label="Kraj"
            value={stay.endedAtUtc
              ? formatDate(stay.endedAtUtc)
              : 'U toku'}
          />
          <Detail label="Boravak" value={formatDays(stay.daysSpent)} />
          <Detail
            label="Nadmorska visina"
            value={stay.altitudeMeters === null
              ? 'Nije evidentirana'
              : `${stay.altitudeMeters} m`}
          />
          <Detail
            label="Orijentacija ulaza"
            value={stay.orientation
              ? orientationLabels[stay.orientation]
              : 'Nije evidentirana'}
          />
        </View>
      </View>
    </View>
  );
}

function TimelineDate({
  value,
  muted = false,
}: {
  value: string;
  muted?: boolean;
}) {
  const formatted = formatDate(value).split(' ');
  const dateClassName = muted
    ? 'text-right text-xs text-muted'
    : 'text-right text-xs font-bold text-foreground';

  return (
    <View className="items-end">
      <Text className={dateClassName}>
        {formatted.slice(0, 2).join(' ')}
      </Text>
      <Text className={dateClassName}>
        {formatted[2] ?? ''}
      </Text>
    </View>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-foreground">
        {value}
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
      <Ionicons
        name="time-outline"
        size={30}
        color={colors.primary}
      />
      <Text className="mt-3 text-center text-base font-semibold text-foreground">
        Još nema evidentiranih boravaka.
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">
        Učitavanje boravaka...
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
        Nije moguće učitati boravke pčelinjaka.
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
