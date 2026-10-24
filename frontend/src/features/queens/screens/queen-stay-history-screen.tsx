import Ionicons from '@react-native-vector-icons/ionicons';
import { TimelineDate } from '@/shared/components/timeline/timeline-date';
import { TimelineItem } from '@/shared/components/timeline/timeline-item';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { HiveHeaderIllustration } from '@/features/hives/components/hive-header-illustration';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

import { useQueenStays } from '../hooks/use-queen-stays';
import type { QueenStayHive, QueenStayHistoryItem } from '../types/queen-stay-history';

type QueenStayHistoryScreenProps = {
  hiveId: string;
  colonyId: string;
  queenId: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  const [year, month, day] = value.split('-');

  return year && month && day ? `${day}.${month}.${year}.` : value;
}

function getColonyOriginLabel(origin: string | null) {
  switch (origin) {
    case 'swarm':
      return 'Roj';
    case 'purchased':
      return 'Kupljeno';
    case 'split':
      return 'Podelom';
    default:
      return '—';
  }
}

function getIntroductionMethodLabel(method: string | null) {
  switch (method) {
    case 'placement':
      return 'Dodavanjem';
    case 'caged':
      return 'U kavezu';
    case 'direct':
      return 'Direktno';
    case 'unknown':
      return 'Nepoznato';
    case 'other':
      return 'Drugo';
    default:
      return '—';
  }
}

function getIntroductionOutcomeLabel(outcome: string | null) {
  switch (outcome) {
    case 'accepted':
      return 'Prihvaćena';
    case 'killed':
      return 'Ubijena';
    case 'missing':
      return 'Nestala';
    case 'unverified':
      return 'Nije provereno';
    case 'other':
      return 'Drugo';
    default:
      return '—';
  }
}

export function QueenStayHistoryScreen({ hiveId, colonyId, queenId }: QueenStayHistoryScreenProps) {
  const { openDrawer } = useAppDrawer();
  const staysQuery = useQueenStays(queenId);
  const stays = staysQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (staysQuery.isLoading) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <LoadingState label="Učitavanje boravaka matice..." />
      </Screen>
    );
  }

  if (staysQuery.isError) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <ErrorState
          onRetry={() => {
            void staysQuery.refetch();
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
              accessibilityLabel="Nazad na detalje matice"
              onPress={() => {
                router.replace({
                  pathname: '/hives/[hiveId]/colonies/[colonyId]/queens/[queenId]',
                  params: {
                    hiveId,
                    colonyId,
                    queenId,
                  },
                } as never);
              }}
              className="self-start py-2"
            >
              <Text className="text-sm font-semibold text-primary">← Matica</Text>
            </Pressable>

            <Text className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">
              Matica
            </Text>
            <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              Istorija boravaka
            </Text>
            <Text className="mt-2 text-sm text-muted">
              Svi evidentirani boravci matice u pčelinjim društvima.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
            <Ionicons name="time-outline" size={30} color={colors.primary} />
            <Text className="mt-3 text-center text-base font-semibold text-foreground">
              Još nema evidentiranih boravaka.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <QueenStayTimelineItem
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

function QueenStayTimelineItem({
  stay,
  isFirst,
  isLast,
}: {
  stay: QueenStayHistoryItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <TimelineItem
      date={
        <TimelineDate variant="range" start={stay.startedOn} end={stay.endedOn} showTime={false} />
      }
      isFirst={isFirst}
      isLast={isLast}
    >
      <View className="mb-5 flex-1 rounded-3xl border border-border bg-surface px-4 py-4">
        <View className="flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons name="heart-outline" size={21} color={colors.primary} />
          </View>
          <Text className="ml-3 flex-1 text-base font-bold text-foreground">
            Boravak u pčelinjem društvu
          </Text>
        </View>

        <Detail label="Način dodavanja">
          {getIntroductionMethodLabel(stay.introductionMethod)}
        </Detail>
        <Detail label="Ishod dodavanja">
          {getIntroductionOutcomeLabel(stay.introductionOutcome)}
        </Detail>
        <Detail label="Poreklo društva">{getColonyOriginLabel(stay.colonyOrigin)}</Detail>
        <Detail label="Društvo formirano">{formatDate(stay.colonyFormedOn)}</Detail>

        {stay.hives.length === 1 ? (
          <View className="border-t border-border pt-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
              Košnica
            </Text>
            <HiveSummary hive={stay.hives[0]} />
          </View>
        ) : stay.hives.length > 1 ? (
          <View className="border-t border-border pt-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
              Košnice tokom boravka
            </Text>
            <Text className="mt-1 text-sm text-muted">
              Društvo je tokom ovog boravka premešteno u druge košnice.
            </Text>
            <View className="mt-3 gap-2">
              {stay.hives.map((hive) => (
                <View
                  key={hive.id}
                  className="rounded-2xl border border-border bg-background px-3 py-2"
                >
                  <HiveSummary hive={hive} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="border-t border-border pt-4">
            <Text className="text-sm text-muted">Košnica za ovaj boravak nije dostupna.</Text>
          </View>
        )}

        {stay.notes ? (
          <View className="border-t border-border pt-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
              Napomena o boravku
            </Text>
            <Text className="mt-1 text-base leading-6 text-foreground">{stay.notes}</Text>
          </View>
        ) : null}
      </View>
    </TimelineItem>
  );
}

function Detail({ label, children }: { label: string; children: string }) {
  return (
    <View className="border-t border-border py-4">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</Text>
      <Text className="mt-1 text-base text-foreground">{children}</Text>
    </View>
  );
}

function HiveSummary({ hive }: { hive: QueenStayHive }) {
  return (
    <View className="mt-2 flex-row items-center">
      <HiveHeaderIllustration colorHex={hive.colorHex} size={46} accessible={false} />
      <Text className="ml-2 flex-1 text-base font-semibold text-foreground">{hive.label}</Text>
    </View>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">{label}</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati boravke matice.
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
