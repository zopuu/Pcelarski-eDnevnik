import Ionicons from '@react-native-vector-icons/ionicons';
import { TimelineDate } from '@/shared/components/timeline/timeline-date';
import { TimelineItem } from '@/shared/components/timeline/timeline-item';
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
import { getPattyTypeLabel } from '@/features/patty-feedings/utils/patty-labels';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

import { getMaintenanceTypeLabel } from '@/features/hive-maintenance/utils/maintenance-labels';

import { getInspectionTypeLabel } from '../utils/inspection-labels';

type HiveActionHistoryScreenProps = {
  hiveId: string;
};

export function HiveActionHistoryScreen({
  hiveId,
}: HiveActionHistoryScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const historyQuery = useHiveActionHistory(hiveId);
  const actions = historyQuery.data?.pages.flatMap((page) => page.items) ?? [];

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
              Pregledi, prihrane, tretmani i radovi na košnici, od najnovijeg
              ka najstarijem.
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
  const isInspection = action.type === 'inspection';
  const hasDetailScreen =
    isInspection ||
    action.type === 'varroaTreatment' ||
    action.type === 'syrupFeeding' ||
    action.type === 'pattyFeeding' ||
    action.type === 'honeyFrameFeeding' ||
    action.type === 'insulation' ||
    action.type === 'maintenance';
  const ratingClassName = isInspection
    ? getRatingBorderClassName(action.summary.overallConditionRating)
    : 'border-primary';
  const title = getActionTitle(action);

  return (
    <TimelineItem
      date={<TimelineDate variant="instant" value={action.performedAt} showTime={true} />}
      isFirst={isFirst}
      isLast={isLast}
    >
      <Pressable
        accessibilityRole={hasDetailScreen ? 'button' : undefined}
        accessibilityLabel={hasDetailScreen ? `Otvori: ${title}` : undefined}
        disabled={!hasDetailScreen}
        onPress={() => openActionDetail(hiveId, action)}
        className={`mb-5 flex-1 rounded-3xl border-2 bg-surface px-4 py-4 ${ratingClassName}`}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <View className="flex-row items-start">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons
              name={getActionIcon(action)}
              size={21}
              color={colors.primary}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-foreground">{title}</Text>
            <Text className="mt-1 text-sm text-muted">
              {getActionDescription(action)}
            </Text>
          </View>
          {hasDetailScreen && (
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          )}
        </View>

        <ActionSummary action={action} />
      </Pressable>
    </TimelineItem>
  );
}

function ActionSummary({ action }: { action: HiveActionHistoryItem }) {
  switch (action.type) {
    case 'inspection':
      return <InspectionSummary action={action} />;
    case 'varroaTreatment':
      return <TreatmentSummary action={action} />;
    case 'syrupFeeding':
      return <SyrupFeedingSummary action={action} />;
    case 'pattyFeeding':
      return <PattyFeedingSummary action={action} />;
    case 'honeyFrameFeeding':
      return <HoneyFrameFeedingSummary action={action} />;
    case 'insulation':
      return <InsulationSummary action={action} />;
    case 'maintenance':
      return null;
    case 'superManagement':
      return <SuperManagementSummary action={action} />;
  }
}

function InspectionSummary({
  action,
}: {
  action: Extract<HiveActionHistoryItem, { type: 'inspection' }>;
}) {
  return (
    <>
      <View className="mt-4 flex-row items-center justify-between border-t border-border pt-3">
        <Text className="text-sm text-muted">Opšta ocena</Text>
        <Text className="text-base font-bold text-foreground">
          {action.summary.overallConditionRating === null
            ? 'Nije ocenjena'
            : `${action.summary.overallConditionRating}/5`}
        </Text>
      </View>
      {action.summary.hasHealthIssue && (
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

function TreatmentSummary({
  action,
}: {
  action: Extract<HiveActionHistoryItem, { type: 'varroaTreatment' }>;
}) {
  return <SummaryRow label="Doza po košnici" value={formatTreatmentDose(action)} />;
}

function SyrupFeedingSummary({
  action,
}: {
  action: Extract<HiveActionHistoryItem, { type: 'syrupFeeding' }>;
}) {
  return (
    <View className="mt-4 border-t border-border pt-3">
      <SummaryRow label="Dato sirupa" value={formatSyrupQuantity(action.summary.quantityMl)} compact />
      <SummaryRow label="Odnos šećer : voda" value={formatSyrupRatio(action)} compact />
    </View>
  );
}

function PattyFeedingSummary({
  action,
}: {
  action: Extract<HiveActionHistoryItem, { type: 'pattyFeeding' }>;
}) {
  return (
    <View className="mt-4 border-t border-border pt-3">
      <SummaryRow label="Dato pogače" value={formatPattyMass(action.summary.massG)} compact />
      <SummaryRow label="Vrsta" value={getPattyTypeLabel(action.summary.pattyType)} compact />
    </View>
  );
}

function HoneyFrameFeedingSummary({
  action,
}: {
  action: Extract<HiveActionHistoryItem, { type: 'honeyFrameFeeding' }>;
}) {
  return (
    <SummaryRow
      label="Dato ramova"
      value={formatFrames(action.summary.frameCount)}
    />
  );
}

function InsulationSummary({
  action,
}: {
  action: Extract<HiveActionHistoryItem, { type: 'insulation' }>;
}) {
  return <SummaryRow label="Materijali" value={getInsulationMaterials(action)} />;
}

function SuperManagementSummary({
  action,
}: {
  action: Extract<HiveActionHistoryItem, { type: 'superManagement' }>;
}) {
  return (
    <SummaryRow
      label="Obuhvaćeno"
      value={getSuperManagementDescription(action)}
    />
  );
}

function SummaryRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <View
      className={`${compact ? 'mt-2' : 'mt-4 border-t border-border pt-3'} flex-row items-center justify-between`}
    >
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function getActionTitle(action: HiveActionHistoryItem) {
  switch (action.type) {
    case 'inspection':
      return getInspectionTypeLabel(action.summary.inspectionType);
    case 'varroaTreatment':
      return 'Tretman protiv varoe';
    case 'syrupFeeding':
      return 'Prihrana sirupom';
    case 'pattyFeeding':
      return 'Prihrana pogačom';
    case 'honeyFrameFeeding':
      return 'Prihrana ramovima meda';
    case 'insulation':
      return 'Izolacija košnice';
    case 'maintenance':
      return 'Održavanje';
    case 'superManagement':
      const superSummary = getSuperManagementSummary(action);
      if (!superSummary.available) return 'Upravljanje nastavcima';
      if (superSummary.addedSuperCount > 0) return 'Dodavanje nastavaka';
      if (superSummary.removeForHarvestCount > 0 && superSummary.removeAndArchiveCount > 0) return 'Skidanje nastavaka';
      if (superSummary.removeForHarvestCount > 0) return 'Skidanje nastavaka za vrcanje';
      return 'Arhiviranje nastavaka';
  }
}

function getActionDescription(action: HiveActionHistoryItem) {
  switch (action.type) {
    case 'inspection':
      return 'Pregled košnice';
    case 'varroaTreatment':
      return action.summary.productName;
    case 'syrupFeeding':
      return `Dato ${formatSyrupQuantity(action.summary.quantityMl)} · ${formatSyrupRatio(action)}`;
    case 'pattyFeeding':
      return `${formatPattyMass(action.summary.massG)} · ${action.summary.manufacturer || getPattyTypeLabel(action.summary.pattyType)}`;
    case 'honeyFrameFeeding':
      return 'Evidentirana prihrana ramovima meda';
    case 'insulation':
      return action.summary.operation === 'add' ? 'Dodavanje izolacije' : 'Uklanjanje izolacije';
    case 'maintenance':
      return getMaintenanceTypeLabel(action.summary.maintenanceType);
    case 'superManagement':
      return getSuperManagementDescription(action);
  }
}

function getSuperManagementDescription(
  action: Extract<HiveActionHistoryItem, { type: 'superManagement' }>,
) {
  const summary = getSuperManagementSummary(action);
  if (!summary.available) return 'Detalji upravljanja nastavcima nisu dostupni.';
  if (summary.addedSuperCount > 0) {
    return `${summary.affectedSuperCount} ${getSuperWord(summary.affectedSuperCount)} · ${summary.addedFrameCount} ${getFrameWord(summary.addedFrameCount)}`;
  }
  if (summary.removeForHarvestCount > 0 && summary.removeAndArchiveCount > 0) {
    return `${summary.affectedSuperCount} ${getSuperWord(summary.affectedSuperCount)} · ${summary.removeForHarvestCount} za vrcanje · ${summary.removeAndArchiveCount} ${summary.removeAndArchiveCount === 1 ? 'arhiviran' : 'arhivirana'} · ${summary.harvestableFrameCount} ${getFrameWord(summary.harvestableFrameCount)} za vrcanje`;
  }
  if (summary.removeForHarvestCount > 0) {
    return `${summary.affectedSuperCount} ${getSuperWord(summary.affectedSuperCount)} · ${summary.harvestableFrameCount} ${getFrameWord(summary.harvestableFrameCount)} za vrcanje`;
  }
  return `${summary.affectedSuperCount} ${getSuperWord(summary.affectedSuperCount)}`;
}

function getSuperManagementSummary(
  action: Extract<HiveActionHistoryItem, { type: 'superManagement' }>,
) {
  // Accept either API casing while a mobile client and API host are upgraded independently.
  const source = action.summary as typeof action.summary & Record<string, unknown>;
  const getCount = (camelCase: keyof typeof action.summary, pascalCase: string) => {
    const value = source[camelCase] ?? source[pascalCase];
    return typeof value === 'number' ? value : 0;
  };
  const available =
    typeof source.affectedSuperCount === 'number' ||
    typeof source.AffectedSuperCount === 'number';

  return {
    available,
    affectedSuperCount: getCount('affectedSuperCount', 'AffectedSuperCount'),
    addedSuperCount: getCount('addedSuperCount', 'AddedSuperCount'),
    addedFrameCount: getCount('addedFrameCount', 'AddedFrameCount'),
    removeForHarvestCount: getCount('removeForHarvestCount', 'RemoveForHarvestCount'),
    removeAndArchiveCount: getCount('removeAndArchiveCount', 'RemoveAndArchiveCount'),
    harvestableFrameCount: getCount('harvestableFrameCount', 'HarvestableFrameCount'),
  };
}

function getSuperWord(count: number) {
  return count === 1 ? 'nastavak' : count < 5 ? 'nastavka' : 'nastavaka';
}

function getFrameWord(count: number) {
  return count === 1 ? 'ram' : 'ramova';
}

function getActionIcon(action: HiveActionHistoryItem) {
  switch (action.type) {
    case 'inspection':
      return 'search-outline' as const;
    case 'varroaTreatment':
      return 'bug-outline' as const;
    case 'syrupFeeding':
      return 'water-outline' as const;
    case 'pattyFeeding':
      return 'nutrition-outline' as const;
    case 'honeyFrameFeeding':
      return 'albums-outline' as const;
    case 'insulation':
      return 'layers-outline' as const;
    case 'maintenance':
      return 'build-outline' as const;
    case 'superManagement':
      return 'grid-outline' as const;
  }
}

function openActionDetail(hiveId: string, action: HiveActionHistoryItem) {
  switch (action.type) {
    case 'inspection':
      router.push({
        pathname: '/hives/[hiveId]/inspections/[inspectionId]',
        params: { hiveId, inspectionId: action.id },
      });
      return;
    case 'syrupFeeding':
      router.push({
        pathname: '/hives/[hiveId]/syrup-feedings/[feedingId]',
        params: { hiveId, feedingId: action.id },
      });
      return;
    case 'pattyFeeding':
      router.push({
        pathname: '/hives/[hiveId]/patty-feedings/[feedingId]',
        params: { hiveId, feedingId: action.id },
      });
      return;
    case 'honeyFrameFeeding':
      router.push({
        pathname: '/hives/[hiveId]/honey-frame-feedings/[feedingId]',
        params: { hiveId, feedingId: action.id },
      });
      return;
    case 'varroaTreatment':
      router.push({
        pathname: '/hives/[hiveId]/varroa-treatments/[treatmentId]',
        params: { hiveId, treatmentId: action.id },
      });
      return;
    case 'insulation':
      router.push({
        pathname: '/hives/[hiveId]/insulation/[actionId]',
        params: { hiveId, actionId: action.id },
      });
      return;
    case 'maintenance':
      router.push({
        pathname: '/hives/[hiveId]/maintenance/[actionId]',
        params: { hiveId, actionId: action.id },
      });
      return;
    default:
      return;
  }
}

function formatTreatmentDose(
  action: Extract<HiveActionHistoryItem, { type: 'varroaTreatment' }>,
) {
  const unitLabels = {
    ml: 'ml',
    strips: 'trake',
    g: 'g',
  } as const;

  return `${new Intl.NumberFormat('sr-Latn-RS', {
    maximumFractionDigits: 2,
  }).format(action.summary.doseAmount)} ${unitLabels[action.summary.doseUnit]}`;
}

function formatPattyMass(massG: number) {
  return `${new Intl.NumberFormat('sr-Latn-RS').format(massG)} g`;
}

function formatFrames(frameCount: number) {
  return `${frameCount} ${
    frameCount === 1 ? 'ram' : frameCount >= 2 && frameCount <= 4 ? 'rama' : 'ramova'
  }`;
}

function formatSyrupQuantity(quantityMl: number) {
  return `${new Intl.NumberFormat('sr-Latn-RS').format(quantityMl)} ml`;
}

function formatSyrupRatio(
  action: Extract<HiveActionHistoryItem, { type: 'syrupFeeding' }>,
) {
  const formatter = new Intl.NumberFormat('sr-Latn-RS', {
    maximumFractionDigits: 4,
  });

  return `${formatter.format(action.summary.sugarParts)} : ${formatter.format(action.summary.waterParts)}`;
}

function getInsulationMaterials(
  action: Extract<HiveActionHistoryItem, { type: 'insulation' }>,
) {
  return [
    action.summary.paper ? 'Papir' : null,
    action.summary.eps ? 'Stiropor' : null,
    action.summary.xps ? 'Stirodur' : null,
  ]
    .filter(Boolean)
    .join(', ');
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
        Aktivnosti koje zabeležite za ovu košnicu biće prikazane ovde.
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
