import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useHiveActionHistory } from '@/features/hive-actions/hooks/use-hive-action-history';
import type { HiveActionHistoryItem } from '@/features/hive-actions/types/hive-action-history';
import { useHive } from '@/features/hives/hooks/use-hive';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

import { getInspectionTypeLabel } from '../utils/inspection-labels';

type HiveActionHistoryScreenProps = {
  hiveId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function HiveActionHistoryScreen({
  hiveId,
}: HiveActionHistoryScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const historyQuery = useHiveActionHistory(hiveId);
  const actions =
    historyQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (hiveQuery.isLoading || historyQuery.isLoading) {
    return <StateScreen label="Učitavanje istorije aktivnosti..." />;
  }

  if (hiveQuery.isError || historyQuery.isError || !hiveQuery.data) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <ErrorState
          onRetry={() => {
            void Promise.all([hiveQuery.refetch(), historyQuery.refetch()]);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
          flexGrow: actions.length === 0 ? 1 : undefined,
        }}
        ListHeaderComponent={
          <View className="mb-7">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nazad na košnicu"
              onPress={() => router.back()}
              className="self-start py-2"
            >
              <Text className="text-sm font-semibold text-primary">
                ← Košnica
              </Text>
            </Pressable>
            <Text className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">
              Košnica
            </Text>
            <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {hiveQuery.data.label}
            </Text>
            <Text className="mt-8 text-xl font-bold text-foreground">
              Istorija aktivnosti
            </Text>
            <Text className="mt-1 text-sm leading-5 text-muted">
              Pregledi i tretmani protiv varoe, od najnovijeg ka najstarijem.
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <HiveActionTimelineItem
            hiveId={hiveId}
            action={item}
            isFirst={index === 0}
            isLast={index === actions.length - 1}
          />
        )}
        onEndReached={() => {
          if (historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
            void historyQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          historyQuery.isFetchingNextPage ? (
            <ActivityIndicator className="my-5" color={colors.primary} />
          ) : null
        }
      />
    </Screen>
  );
}

function HiveActionTimelineItem({
  hiveId,
  action,
  isFirst,
  isLast,
}: {
  hiveId: string;
  action: HiveActionHistoryItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const isInspection = action.kind === 'inspection';
  const ratingClassName = isInspection
    ? getRatingBorderClassName(action.overallConditionRating)
    : 'border-primary';
  const title = isInspection
    ? getInspectionTypeLabel(action.inspectionType)
    : 'Tretman protiv varoe';

  return (
    <View className="flex-row">
      <View className="w-20 items-end justify-center pr-3">
        <Text className="text-right text-xs font-bold text-foreground">
          {formatDate(action.performedAt)}
        </Text>
        <Text className="mt-1 text-right text-xs text-muted">
          {formatTime(action.performedAt)}
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
        accessibilityLabel={`Otvori: ${title}`}
        onPress={() => {
          router.push(
            isInspection
              ? {
                  pathname: '/hives/[hiveId]/inspections/[inspectionId]',
                  params: { hiveId, inspectionId: action.id },
                }
              : {
                  pathname: '/hives/[hiveId]/varroa-treatments/[treatmentId]',
                  params: { hiveId, treatmentId: action.id },
                },
          );
        }}
        className={`mb-5 flex-1 rounded-3xl border-2 bg-surface px-4 py-4 ${ratingClassName}`}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <View className="flex-row items-start">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons
              name={isInspection ? 'search-outline' : 'bug-outline'}
              size={21}
              color={colors.primary}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-foreground">{title}</Text>
            <Text className="mt-1 text-sm text-muted">
              {isInspection
                ? 'Pregled košnice'
                : formatTreatmentSummary(action)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </View>

        {isInspection ? (
          <InspectionSummary action={action} />
        ) : (
          <TreatmentSummary action={action} />
        )}
      </Pressable>
    </View>
  );
}

function InspectionSummary({ action }: { action: HiveActionHistoryItem }) {
  return (
    <>
      <View className="mt-4 flex-row items-center justify-between border-t border-border pt-3">
        <Text className="text-sm text-muted">Opšta ocena</Text>
        <Text className="text-base font-bold text-foreground">
          {action.overallConditionRating === null
            ? 'Nije ocenjena'
            : `${action.overallConditionRating}/5`}
        </Text>
      </View>

      {action.hasHealthIssue && (
        <View className="mt-3 flex-row items-center self-start rounded-full bg-error/10 px-3 py-1.5">
          <Ionicons name="medkit-outline" size={15} color={colors.error} />
          <Text className="ml-1.5 text-xs font-bold text-error">
            Uočeno zdravstveno zapažanje
          </Text>
        </View>
      )}
    </>
  );
}

function TreatmentSummary({ action }: { action: HiveActionHistoryItem }) {
  return (
    <View className="mt-4 flex-row items-center justify-between border-t border-border pt-3">
      <Text className="text-sm text-muted">Doza po košnici</Text>
      <Text className="text-base font-bold text-foreground">
        {formatTreatmentDose(action)}
      </Text>
    </View>
  );
}

function formatTreatmentSummary(action: HiveActionHistoryItem) {
  return action.productName ?? 'Evidentiran tretman';
}

function formatTreatmentDose(action: HiveActionHistoryItem) {
  if (action.doseAmount === null || action.doseUnit === null) {
    return '—';
  }

  const unitLabels = {
    ml: 'ml',
    strips: 'trake',
    g: 'g',
  } as const;

  return `${new Intl.NumberFormat('sr-Latn-RS', {
    maximumFractionDigits: 2,
  }).format(action.doseAmount)} ${unitLabels[action.doseUnit]}`;
}

function getRatingBorderClassName(rating: number | null) {
  if (rating === 1 || rating === 2) {
    return 'border-error';
  }

  if (rating === 3 || rating === 4) {
    return 'border-warning';
  }

  if (rating === 5) {
    return 'border-success';
  }

  return 'border-border';
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
      <Ionicons name="reader-outline" size={30} color={colors.primary} />
      <Text className="mt-3 text-center text-base font-semibold text-foreground">
        Još nema evidentiranih aktivnosti.
      </Text>
      <Text className="mt-1 text-center text-sm leading-5 text-muted">
        Pregledi i tretmani protiv varoe koje zabeležite za ovu košnicu biće prikazani ovde.
      </Text>
    </View>
  );
}

function StateScreen({ label }: { label: string }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted">{label}</Text>
      </View>
    </Screen>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati istoriju aktivnosti.
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
