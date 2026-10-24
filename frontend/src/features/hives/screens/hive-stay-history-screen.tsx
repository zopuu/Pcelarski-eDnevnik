import Ionicons from '@react-native-vector-icons/ionicons';
import { TimelineDate } from '@/shared/components/timeline/timeline-date';
import { TimelineItem } from '@/shared/components/timeline/timeline-item';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { useHive } from '../hooks/use-hive';
import { useHiveStayHistory } from '../hooks/use-hive-stay-history';
import type { HiveStayHistoryItem } from '../types/hive-stay';

import { useAppDrawer } from '@/providers/app-drawer-provider';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { environment } from '@/shared/config/environment';
import { colors } from '@/shared/theme/colors';

type HiveStayHistoryScreenProps = {
  hiveId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDays(daysSpent: number) {
  return daysSpent === 1 ? '1 dan' : `${daysSpent} dana`;
}

export function HiveStayHistoryScreen({ hiveId }: HiveStayHistoryScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const staysQuery = useHiveStayHistory(hiveId);
  const stays = staysQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const isLoading = hiveQuery.isLoading || staysQuery.isLoading;
  const isError = hiveQuery.isError || staysQuery.isError;

  if (isLoading) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <LoadingState />
      </Screen>
    );
  }

  if (isError || !hiveQuery.data) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <LoadError
          onRetry={() => {
            void Promise.all([hiveQuery.refetch(), staysQuery.refetch()]);
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
              accessibilityLabel="Nazad na košnicu"
              onPress={() => {
                router.back();
              }}
              className="self-start py-2"
            >
              <Text className="text-sm font-semibold text-primary">← Košnica</Text>
            </Pressable>
            <Text className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">
              Košnica
            </Text>
            <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {hiveQuery.data.label}
            </Text>
            <Text className="mt-8 text-xl font-bold text-foreground">Istorija boravaka</Text>
            <Text className="mt-1 text-sm text-muted">
              Pčelinjaci kojima je košnica pripadala, od najnovijeg.
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <HiveStayTimelineItem
            stay={item}
            isFirst={index === 0}
            isLast={index === stays.length - 1}
          />
        )}
        onEndReached={() => {
          if (staysQuery.hasNextPage && !staysQuery.isFetchingNextPage) {
            void staysQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          staysQuery.isFetchingNextPage ? (
            <ActivityIndicator className="my-5" color={colors.primary} />
          ) : null
        }
      />
    </Screen>
  );
}

function HiveStayTimelineItem({
  stay,
  isFirst,
  isLast,
}: {
  stay: HiveStayHistoryItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <TimelineItem
      date={
        <TimelineDate
          variant="range"
          start={stay.startedAtUtc}
          end={stay.endedAtUtc}
          showTime={false}
        />
      }
      isFirst={isFirst}
      isLast={isLast}
      muted={!stay.isActive}
    >
      <View className="mb-5 flex-1 rounded-3xl border border-border bg-surface px-4 py-4">
        <View className="flex-row items-start">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons name="business-outline" size={21} color={colors.primary} />
          </View>
          <View className="ml-3 flex-1 pr-3">
            <Text className="text-base font-bold text-foreground">
              {stay.apiaryName?.trim() || 'Pčelinjak bez naziva'}
            </Text>
            {stay.isActive && (
              <View className="mt-1 self-start rounded-full bg-success/10 px-2 py-1">
                <Text className="text-xs font-bold text-success">Trenutno aktivan</Text>
              </View>
            )}
          </View>
          {stay.apiaryImageUrl && (
            <Image
              source={`${environment.apiUrl}${stay.apiaryImageUrl}`}
              accessibilityLabel={`Slika pčelinjaka ${stay.apiaryName ?? ''}`}
              contentFit="cover"
              style={{
                width: 88,
                height: 88,
                borderRadius: 16,
              }}
            />
          )}
        </View>

        <View className="mt-4 gap-3 border-t border-border pt-4">
          <Detail label="Početak" value={formatDate(stay.startedAtUtc)} />
          <Detail label="Kraj" value={stay.endedAtUtc ? formatDate(stay.endedAtUtc) : 'U toku'} />
          <Detail label="Boravak" value={formatDays(stay.daysSpent)} />
        </View>

        <View className="mt-4 border-t border-border pt-4">
          <Text className="text-sm text-muted">Beleška o boravku</Text>
          <Text className="mt-1 text-sm leading-5 text-foreground">
            {stay.note?.trim() || 'Nema beleške za ovaj boravak.'}
          </Text>
        </View>
      </View>
    </TimelineItem>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
      <Ionicons name="time-outline" size={30} color={colors.primary} />
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
      <Text className="mt-3 text-muted">Učitavanje boravaka...</Text>
    </View>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati boravke košnice.
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
