import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useCurrentColony } from "@/features/colonies/hooks/use-current-colony";
import { useHive } from "@/features/hives/hooks/use-hive";
import { useCurrentQueen } from "@/features/queens/hooks/use-current-queen";
import { colors } from "@/shared/theme/colors";

import { HiveInspectionHeader } from "../components/hive-inspection-header";
import { useHiveInspection } from "../hooks/use-hive-inspection";
import type { HiveInspectionDetails } from "../types/hive-inspection";
import {
  getBroodPatternLabel,
  getBroodStageLabel,
  getDiseaseLabel,
  getInspectionTypeLabel,
  getPestLabel,
  getPredatorLabel,
} from "../utils/inspection-labels";

type HiveInspectionDetailsScreenProps = {
  hiveId: string;
  inspectionId: string;
};

type DetailRow = {
  label: string;
  value: string | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function rating(value: number | null) {
  return value === null ? null : `${value}/5`;
}

function count(value: number | null, suffix = "") {
  return value === null ? null : `${value}${suffix}`;
}

function booleanValue(value: boolean | null) {
  return value === null ? null : value ? "Da" : "Ne";
}

function selected<T>(value: T | null, getLabel: (item: T) => string) {
  return value === null ? null : getLabel(value);
}

function customValue(label: string, detail: string | null) {
  return detail?.trim() ? `${label}: ${detail.trim()}` : label;
}

export function HiveInspectionDetailsScreen({
  hiveId,
  inspectionId,
}: HiveInspectionDetailsScreenProps) {
  const hiveQuery = useHive(hiveId);
  const inspectionQuery = useHiveInspection(hiveId, inspectionId);
  const colonyQuery = useCurrentColony(hiveId);
  const queenQuery = useCurrentQueen(colonyQuery.data?.id ?? null);

  if (hiveQuery.isLoading || inspectionQuery.isLoading) {
    return <LoadingState />;
  }

  if (
    hiveQuery.isError ||
    inspectionQuery.isError ||
    !hiveQuery.data ||
    !inspectionQuery.data
  ) {
    return (
      <ErrorState
        onRetry={() => {
          void Promise.all([hiveQuery.refetch(), inspectionQuery.refetch()]);
        }}
      />
    );
  }

  const isQueenLoading =
    colonyQuery.isLoading || Boolean(colonyQuery.data && queenQuery.isLoading);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Vrati se na istoriju aktivnosti"
        onPress={() => router.back()}
        className="mb-3 min-h-11 self-start justify-center py-2"
      >
        <Text className="text-base font-semibold text-primary">
          ← Istorija aktivnosti
        </Text>
      </Pressable>

      <Text className="text-2xl font-bold text-foreground">
        Pregled košnice
      </Text>
      <Text className="mt-1 text-sm leading-5 text-muted">
        Evidentirani podaci sa pregleda.
      </Text>

      <HiveInspectionHeader
        hive={hiveQuery.data}
        queen={queenQuery.data ?? null}
        isQueenLoading={isQueenLoading}
      />

      <InspectionDetails inspection={inspectionQuery.data} />
    </ScrollView>
  );
}

function InspectionDetails({
  inspection,
}: {
  inspection: HiveInspectionDetails;
}) {
  const overviewRows: DetailRow[] = [
    {
      label: "Datum i vreme pregleda",
      value: formatDateTime(inspection.performedAt),
    },
    {
      label: "Vrsta pregleda",
      value:
        inspection.inspectionType === null
          ? null
          : getInspectionTypeLabel(inspection.inspectionType),
    },
    { label: "Opšte stanje", value: rating(inspection.overallConditionRating) },
    { label: "Brojnost pčela", value: rating(inspection.populationRating) },
    { label: "Mirnoća društva", value: rating(inspection.temperamentRating) },
    { label: "Snaga društva", value: rating(inspection.colonyStrength) },
  ];

  const observationRows: DetailRow[] = [
    { label: "Društvo se rojilo", value: booleanValue(inspection.hasSwarmed) },
    { label: "Matica viđena", value: booleanValue(inspection.queenSeen) },
    { label: "Matica obeležena", value: booleanValue(inspection.queenMarked) },
  ];

  const frameRows: DetailRow[] = [
    {
      label: "Ramovi prekriveni pčelama",
      value: count(inspection.beeCoveredFrameCount),
    },
    { label: "Ramovi sa leglom", value: count(inspection.broodFrameCount) },
    { label: "Ramovi sa medom", value: count(inspection.honeyFrameCount) },
    { label: "Ramovi sa polenom", value: count(inspection.pollenFrameCount) },
    {
      label: "Pokrivenost leglom",
      value: count(inspection.broodCoveragePercentage, "%"),
    },
    {
      label: "Ramovi sa otvorenim leglom",
      value: count(inspection.openBroodFrameCount),
    },
    {
      label: "Ramovi sa zatvorenim leglom",
      value: count(inspection.cappedBroodFrameCount),
    },
  ];

  const foodRows: DetailRow[] = [
    { label: "Zalihe meda", value: rating(inspection.honeyStoresRating) },
    { label: "Zalihe polena", value: rating(inspection.pollenStoresRating) },
    {
      label: "Ukupna procena hrane",
      value: rating(inspection.foodStoreAssessment),
    },
    {
      label: "Procena dostupnog polena",
      value: rating(inspection.pollenStoreAssessment),
    },
    { label: "Rizik od gladovanja", value: rating(inspection.starvationRisk) },
  ];

  const broodRows: DetailRow[] = [
    {
      label: "Obrazac legla",
      value: selected(inspection.broodPattern, getBroodPatternLabel),
    },
    {
      label: "Stadijum legla",
      value: selected(inspection.broodStage, getBroodStageLabel),
    },
    { label: "Prisustvo larvi", value: rating(inspection.larvaePresence) },
    { label: "Kvalitet legla", value: rating(inspection.broodQuality) },
  ];

  const droneRows: DetailRow[] = [
    {
      label: "Trutovsko leglo prisutno",
      value: booleanValue(inspection.droneBroodPresent),
    },
    {
      label: "Obim trutovskog legla",
      value: rating(inspection.droneBroodExtent),
    },
    {
      label: "Odnos trutova i radilica",
      value: rating(inspection.droneWorkerBalance),
    },
  ];

  const queenRows: DetailRow[] = [
    { label: "Broj matičnjaka", value: count(inspection.queenCellCount) },
    { label: "Stadijum matičnjaka", value: rating(inspection.queenCellStage) },
    { label: "Nagon za rojenjem", value: rating(inspection.swarmingTendency) },
  ];

  const healthRows: DetailRow[] = [
    { label: "Nivo varoe", value: rating(inspection.varroaLevel) },
    {
      label: "Bolest",
      value:
        inspection.disease === null
          ? null
          : customValue(
              getDiseaseLabel(inspection.disease),
              inspection.diseaseOther,
            ),
    },
    {
      label: "Štetočina",
      value:
        inspection.pest === null
          ? null
          : customValue(getPestLabel(inspection.pest), inspection.pestOther),
    },
    {
      label: "Predator",
      value:
        inspection.predator === null
          ? null
          : customValue(
              getPredatorLabel(inspection.predator),
              inspection.predatorOther,
            ),
    },
    { label: "Prisustvo buđi", value: booleanValue(inspection.moldPresent) },
    {
      label: "Prekomerna vlaga",
      value: booleanValue(inspection.excessMoisturePresent),
    },
    { label: "Nivo mrtvih pčela", value: rating(inspection.deadBeeLevel) },
    { label: "Miris", value: rating(inspection.odor) },
  ];

  return (
    <View>
      <DetailsSection title="Osnovni podaci" rows={overviewRows} />
      <DetailsSection title="Brza zapažanja" rows={observationRows} />
      <DetailsSection title="Ramovi i pokrivenost leglom" rows={frameRows} />
      <DetailsSection title="Hrana i rizik" rows={foodRows} />
      <DetailsSection title="Leglo" rows={broodRows} />
      <DetailsSection title="Trutovi" rows={droneRows} />
      <DetailsSection title="Matica i rojenje" rows={queenRows} />
      <DetailsSection title="Zdravlje i štetočine" rows={healthRows} />
      {inspection.notes?.trim() && (
        <>
          <SectionTitle>Napomena</SectionTitle>
          <View className="rounded-3xl border border-border bg-surface px-5 py-4">
            <Text className="text-base leading-6 text-foreground">
              {inspection.notes.trim()}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

function DetailsSection({ title, rows }: { title: string; rows: DetailRow[] }) {
  const presentRows = rows.filter((row) => row.value !== null);

  if (presentRows.length === 0) {
    return null;
  }

  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <View className="rounded-3xl border border-border bg-surface px-5 py-1">
        {presentRows.map((row, index) => (
          <View
            key={row.label}
            className={`flex-row items-start justify-between gap-6 py-3 ${
              index === presentRows.length - 1 ? "" : "border-b border-border"
            }`}
          >
            <Text className="flex-1 text-sm text-muted">{row.label}</Text>
            <Text className="flex-1 text-right text-sm font-semibold text-foreground">
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-3 mt-7 text-lg font-bold text-foreground">
      {children}
    </Text>
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">Učitavanje pregleda...</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati pregled.
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
