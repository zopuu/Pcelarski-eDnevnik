import { zodResolver } from "@hookform/resolvers/zod";

import { router } from "expo-router";

import { Controller, useForm, useWatch } from "react-hook-form";
import type { Control, FieldErrors, FieldPath } from "react-hook-form";

import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { HiveInspectionHeader } from "../components/hive-inspection-header";
import {
  BooleanField,
  CountField,
  EnumChoiceField,
  FormTextInput,
  InspectionSection,
  RatingField,
} from "../components/inspection-form-controls";
import { useRecordHiveInspection } from "../hooks/use-record-hive-inspection";
import { recordHiveInspectionSchema } from "../schemas/record-hive-inspection-schema";
import type { RecordHiveInspectionFormValues } from "../schemas/record-hive-inspection-schema";
import type { RecordHiveInspectionRequest } from "../types/hive-inspection";

import { useCurrentColony } from "@/features/colonies/hooks/use-current-colony";
import { useHive } from "@/features/hives/hooks/use-hive";
import { useCurrentQueen } from "@/features/queens/hooks/use-current-queen";
import { ApiError } from "@/shared/api/api-error";
import { DatePickerField } from "@/shared/components/date-picker-field";
import { colors } from "@/shared/theme/colors";
import { formatDateOnly } from "@/shared/utils/date-only";

type RecordHiveInspectionScreenProps = {
  hiveId: string;
};

type RatingFieldName =
  | "overallConditionRating"
  | "populationRating"
  | "temperamentRating"
  | "colonyStrength"
  | "honeyStoresRating"
  | "pollenStoresRating"
  | "droneBroodExtent"
  | "larvaePresence"
  | "droneWorkerBalance"
  | "broodQuality"
  | "queenCellStage"
  | "swarmingTendency"
  | "foodStoreAssessment"
  | "pollenStoreAssessment"
  | "starvationRisk"
  | "varroaLevel"
  | "deadBeeLevel"
  | "odor";

type CountFieldName =
  | "beeCoveredFrameCount"
  | "broodFrameCount"
  | "honeyFrameCount"
  | "pollenFrameCount"
  | "openBroodFrameCount"
  | "cappedBroodFrameCount"
  | "queenCellCount";

type BooleanFieldName =
  | "hasSwarmed"
  | "queenSeen"
  | "queenMarked"
  | "droneBroodPresent"
  | "moldPresent"
  | "excessMoisturePresent";

type FieldDefinition<TName extends string> = {
  name: TName;
  label: string;
};

const defaultValues: RecordHiveInspectionFormValues = {
  performedOn: formatDateOnly(new Date()),
  inspectionType: null,
  overallConditionRating: null,
  populationRating: null,
  temperamentRating: null,
  colonyStrength: null,
  beeCoveredFrameCount: null,
  broodFrameCount: null,
  honeyFrameCount: null,
  pollenFrameCount: null,
  hasSwarmed: null,
  honeyStoresRating: null,
  pollenStoresRating: null,
  broodCoveragePercentage: null,
  openBroodFrameCount: null,
  cappedBroodFrameCount: null,
  broodPattern: null,
  broodStage: null,
  droneBroodPresent: null,
  droneBroodExtent: null,
  larvaePresence: null,
  droneWorkerBalance: null,
  broodQuality: null,
  queenSeen: null,
  queenMarked: null,
  queenCellCount: null,
  queenCellStage: null,
  swarmingTendency: null,
  foodStoreAssessment: null,
  pollenStoreAssessment: null,
  starvationRisk: null,
  varroaLevel: null,
  disease: null,
  diseaseOther: "",
  pest: null,
  pestOther: "",
  predator: null,
  predatorOther: "",
  moldPresent: null,
  excessMoisturePresent: null,
  deadBeeLevel: null,
  odor: null,
  notes: "",
};

const generalRatingFields: readonly FieldDefinition<RatingFieldName>[] = [
  { name: "overallConditionRating", label: "Opšte stanje" },
  { name: "populationRating", label: "Brojnost pčela" },
  { name: "temperamentRating", label: "Mirnoća društva" },
  { name: "colonyStrength", label: "Snaga društva" },
];

const frameCountFields: readonly FieldDefinition<CountFieldName>[] = [
  { name: "beeCoveredFrameCount", label: "Ramovi prekriveni pčelama" },
  { name: "broodFrameCount", label: "Ramovi sa leglom" },
  { name: "honeyFrameCount", label: "Ramovi sa medom" },
  { name: "pollenFrameCount", label: "Ramovi sa polenom" },
  { name: "openBroodFrameCount", label: "Ramovi sa otvorenim leglom" },
  { name: "cappedBroodFrameCount", label: "Ramovi sa zatvorenim leglom" },
];

const foodRatingFields: readonly FieldDefinition<RatingFieldName>[] = [
  { name: "honeyStoresRating", label: "Zalihe meda" },
  { name: "pollenStoresRating", label: "Zalihe polena" },
  { name: "foodStoreAssessment", label: "Ukupna procena hrane" },
  { name: "pollenStoreAssessment", label: "Procena dostupnog polena" },
  { name: "starvationRisk", label: "Rizik od gladovanja" },
];

const broodRatingFields: readonly FieldDefinition<RatingFieldName>[] = [
  { name: "larvaePresence", label: "Prisustvo larvi" },
  { name: "broodQuality", label: "Kvalitet legla" },
];

const droneRatingFields: readonly FieldDefinition<RatingFieldName>[] = [
  { name: "droneBroodExtent", label: "Obim trutovskog legla" },
  { name: "droneWorkerBalance", label: "Odnos trutova i radilica" },
];

const queenRatingFields: readonly FieldDefinition<RatingFieldName>[] = [
  { name: "queenCellStage", label: "Razvijenost matičnjaka" },
  { name: "swarmingTendency", label: "Nagon za rojenjem" },
];

const healthRatingFields: readonly FieldDefinition<RatingFieldName>[] = [
  { name: "varroaLevel", label: "Nivo varoe" },
  { name: "deadBeeLevel", label: "Količina uginulih pčela" },
  { name: "odor", label: "Neuobičajen miris" },
];

const inspectionTypeOptions = [
  { value: "FIRST_SPRING", label: "Prvi prolećni" },
  { value: "SPRING_ROUTINE", label: "Redovni prolećni" },
  { value: "SWARM_CONTROL", label: "Kontrola rojenja" },
  { value: "FIRST_SUMMER", label: "Prvi letnji" },
  { value: "SUMMER_ROUTINE", label: "Redovni letnji" },
  { value: "POST_HARVEST", label: "Posle vrcanja" },
  { value: "AUTUMN_ROUTINE", label: "Jesenji" },
  { value: "PRE_WINTER", label: "Pred zimovanje" },
  { value: "QUEEN_CHECK", label: "Kontrola matice" },
  { value: "HEALTH_CHECK", label: "Zdravstveni" },
  { value: "EMERGENCY", label: "Vanredni" },
  { value: "OTHER", label: "Drugo" },
] as const;

const broodPatternOptions = [
  { value: "COMPACT", label: "Kompaktno" },
  { value: "SPOTTY", label: "Proređeno" },
  { value: "MOTTLED", label: "Šareno" },
  { value: "OTHER", label: "Drugo" },
] as const;

const broodStageOptions = [
  { value: "EGGS", label: "Jaja" },
  { value: "LARVAE", label: "Larve" },
  { value: "CAPPED", label: "Zatvoreno leglo" },
  { value: "MIXED", label: "Mešovito" },
] as const;

const diseaseOptions = [
  { value: "AMERICAN_FOULBROOD", label: "Američka kuga legla" },
  { value: "EUROPEAN_FOULBROOD", label: "Evropska kuga legla" },
  { value: "NOSEMA", label: "Nozemoza" },
  { value: "CHALKBROOD", label: "Krečno leglo" },
  { value: "SACBROOD", label: "Mešinasto leglo" },
  { value: "DEFORMED_WING_VIRUS", label: "Virus deformisanih krila" },
  { value: "OTHER", label: "Drugo" },
] as const;

const pestOptions = [
  { value: "VARROA_MITE", label: "Varoa" },
  { value: "WAX_MOTH", label: "Voštani moljac" },
  { value: "SMALL_HIVE_BEETLE", label: "Mala košničina buba" },
  { value: "BEE_LOUSE", label: "Pčelinja vaš" },
  { value: "ANTS", label: "Mravi" },
  { value: "OTHER", label: "Drugo" },
] as const;

const predatorOptions = [
  { value: "WASP", label: "Osa" },
  { value: "HORNET", label: "Stršljen" },
  { value: "MOUSE", label: "Miš" },
  { value: "BIRD", label: "Ptica" },
  { value: "OTHER", label: "Drugo" },
] as const;

export function RecordHiveInspectionScreen({
  hiveId,
}: RecordHiveInspectionScreenProps) {
  const hiveQuery = useHive(hiveId);
  const colonyQuery = useCurrentColony(hiveId);
  const queenQuery = useCurrentQueen(colonyQuery.data?.id ?? null);
  const mutation = useRecordHiveInspection(hiveId);
  const today = formatDateOnly(new Date());
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<RecordHiveInspectionFormValues>({
    resolver: zodResolver(recordHiveInspectionSchema),
    defaultValues,
  });

  const disease = useWatch({ control, name: "disease" });
  const pest = useWatch({ control, name: "pest" });
  const predator = useWatch({ control, name: "predator" });

  const onSubmit = async (values: RecordHiveInspectionFormValues) => {
    clearErrors();

    try {
      await mutation.mutateAsync(toRequest(values));

      Alert.alert(
        "Pregled uspešno obavljen",
        "Podaci o pregledu košnice su sačuvani.",
        [
          {
            text: "U redu",
            onPress: () => {
              router.replace({
                pathname: "/hives/[hiveId]",
                params: { hiveId },
              } as never);
            },
          },
        ],
      );
    } catch (error) {
      applyServerValidationErrors(error, setError);
    }
  };

  if (hiveQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted">Učitavanje košnice...</Text>
      </View>
    );
  }

  if (hiveQuery.isError || !hiveQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center text-base font-semibold text-error">
          Nije moguće učitati podatke o košnici.
        </Text>
        <Pressable
          onPress={() => void hiveQuery.refetch()}
          className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
        >
          <Text className="font-bold text-background">Pokušaj ponovo</Text>
        </Pressable>
      </View>
    );
  }

  const hive = hiveQuery.data;
  const isQueenLoading =
    colonyQuery.isLoading || Boolean(colonyQuery.data && queenQuery.isLoading);

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={28}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 48,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na detalje košnice"
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-base font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">
          Pregled košnice
        </Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Unesite samo podatke koje ste proverili tokom pregleda.
        </Text>

        <HiveInspectionHeader
          hive={hive}
          queen={queenQuery.data ?? null}
          isQueenLoading={isQueenLoading}
        />

        <SectionTitle>Osnovni podaci o pregledu</SectionTitle>
        <View className="rounded-3xl border border-border bg-surface px-5 pb-1 pt-5">
          <Controller
            control={control}
            name="performedOn"
            render={({ field }) => (
              <DatePickerField
                label="Datum pregleda"
                value={field.value}
                onChange={field.onChange}
                maximumDate={today}
                required
                error={errors.performedOn?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="inspectionType"
            render={({ field }) => (
              <EnumChoiceField
                label="Vrsta pregleda"
                value={field.value}
                onChange={field.onChange}
                options={inspectionTypeOptions}
                error={errors.inspectionType?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <FormTextInput
                label="Napomena"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Zabeležite važno zapažanje..."
                multiline
                error={errors.notes?.message}
              />
            )}
          />
        </View>

        <SectionTitle>Brza zapažanja</SectionTitle>
        <View className="mb-4 rounded-3xl border border-border bg-surface px-5 pb-1 pt-5">
          <BooleanController
            control={control}
            name="hasSwarmed"
            label="Da li se društvo rojilo?"
          />
          <BooleanController
            control={control}
            name="queenSeen"
            label="Da li je matica viđena?"
          />
          <BooleanController
            control={control}
            name="queenMarked"
            label="Da li je matica obeležena?"
          />
        </View>

        <InspectionSection
          title="Opšte ocene"
          description="Stanje, brojnost, temperament i snaga društva"
          defaultOpen
        >
          <RatingControllers
            control={control}
            errors={errors}
            fields={generalRatingFields}
          />
        </InspectionSection>

        <InspectionSection
          title="Ramovi i pokrivenost leglom"
          description="Broj ramova i procenat površine pod leglom"
        >
          <CountControllers
            control={control}
            errors={errors}
            fields={frameCountFields}
          />
          <Controller
            control={control}
            name="broodCoveragePercentage"
            render={({ field }) => (
              <CountField
                label="Pokrivenost leglom"
                value={field.value}
                onChange={field.onChange}
                maximum={100}
                suffix="%"
                error={errors.broodCoveragePercentage?.message}
              />
            )}
          />
        </InspectionSection>

        <InspectionSection
          title="Hrana i rizik"
          description="Zalihe hrane, polen i rizik od gladovanja"
        >
          <RatingControllers
            control={control}
            errors={errors}
            fields={foodRatingFields}
          />
        </InspectionSection>

        <InspectionSection
          title="Leglo"
          description="Obrazac, razvojni stadijum i kvalitet legla"
        >
          <Controller
            control={control}
            name="broodPattern"
            render={({ field }) => (
              <EnumChoiceField
                label="Obrazac legla"
                value={field.value}
                onChange={field.onChange}
                options={broodPatternOptions}
                error={errors.broodPattern?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="broodStage"
            render={({ field }) => (
              <EnumChoiceField
                label="Stadijum legla"
                value={field.value}
                onChange={field.onChange}
                options={broodStageOptions}
                error={errors.broodStage?.message}
              />
            )}
          />
          <RatingControllers
            control={control}
            errors={errors}
            fields={broodRatingFields}
          />
        </InspectionSection>

        <InspectionSection
          title="Trutovi"
          description="Trutovsko leglo i odnos trutova i radilica"
        >
          <BooleanController
            control={control}
            name="droneBroodPresent"
            label="Da li je prisutno trutovsko leglo?"
          />
          <RatingControllers
            control={control}
            errors={errors}
            fields={droneRatingFields}
          />
        </InspectionSection>

        <InspectionSection
          title="Matica i rojenje"
          description="Matičnjaci i procena nagona za rojenjem"
        >
          <CountControllers
            control={control}
            errors={errors}
            fields={[{ name: "queenCellCount", label: "Broj matičnjaka" }]}
          />
          <RatingControllers
            control={control}
            errors={errors}
            fields={queenRatingFields}
          />
        </InspectionSection>

        <InspectionSection
          title="Zdravlje i štetočine"
          description="Varoa, bolesti, štetočine, predatori i uslovi u košnici"
        >
          <RatingControllers
            control={control}
            errors={errors}
            fields={healthRatingFields}
          />
          <Controller
            control={control}
            name="disease"
            render={({ field }) => (
              <EnumChoiceField
                label="Bolest"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);

                  if (value !== "OTHER") {
                    setValue("diseaseOther", "");
                  }
                }}
                options={diseaseOptions}
                error={errors.disease?.message}
              />
            )}
          />
          {disease === "OTHER" && (
            <Controller
              control={control}
              name="diseaseOther"
              render={({ field }) => (
                <FormTextInput
                  label="Druga bolest"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Unesite naziv bolesti"
                  error={errors.diseaseOther?.message}
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="pest"
            render={({ field }) => (
              <EnumChoiceField
                label="Štetočina"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);

                  if (value !== "OTHER") {
                    setValue("pestOther", "");
                  }
                }}
                options={pestOptions}
                error={errors.pest?.message}
              />
            )}
          />
          {pest === "OTHER" && (
            <Controller
              control={control}
              name="pestOther"
              render={({ field }) => (
                <FormTextInput
                  label="Druga štetočina"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Unesite naziv štetočine"
                  error={errors.pestOther?.message}
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="predator"
            render={({ field }) => (
              <EnumChoiceField
                label="Predator"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);

                  if (value !== "OTHER") {
                    setValue("predatorOther", "");
                  }
                }}
                options={predatorOptions}
                error={errors.predator?.message}
              />
            )}
          />
          {predator === "OTHER" && (
            <Controller
              control={control}
              name="predatorOther"
              render={({ field }) => (
                <FormTextInput
                  label="Drugi predator"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Unesite naziv predatora"
                  error={errors.predatorOther?.message}
                />
              )}
            />
          )}
          <BooleanController
            control={control}
            name="moldPresent"
            label="Da li je prisutna buđ?"
          />
          <BooleanController
            control={control}
            name="excessMoisturePresent"
            label="Da li je prisutna prekomerna vlaga?"
          />
        </InspectionSection>

        {mutation.isError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3">
            <Text className="text-sm font-semibold text-error">
              {getMutationErrorMessage(mutation.error)}
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={mutation.isPending}
          onPress={handleSubmit(onSubmit)}
          className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${
            mutation.isPending ? "opacity-60" : ""
          }`}
        >
          {mutation.isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={colors.onPrimary} />
              <Text className="text-base font-bold text-background">
                Čuvanje...
              </Text>
            </View>
          ) : (
            <Text className="text-base font-bold text-background">
              Završi pregled
            </Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-3 mt-7 text-lg font-bold text-foreground">
      {children}
    </Text>
  );
}

function RatingControllers({
  control,
  errors,
  fields,
}: {
  control: Control<RecordHiveInspectionFormValues>;
  errors: FieldErrors<RecordHiveInspectionFormValues>;
  fields: readonly FieldDefinition<RatingFieldName>[];
}) {
  return fields.map((definition) => (
    <Controller
      key={definition.name}
      control={control}
      name={definition.name}
      render={({ field }) => (
        <RatingField
          label={definition.label}
          value={field.value}
          onChange={field.onChange}
          error={getFieldError(errors, definition.name)}
        />
      )}
    />
  ));
}

function CountControllers({
  control,
  errors,
  fields,
}: {
  control: Control<RecordHiveInspectionFormValues>;
  errors: FieldErrors<RecordHiveInspectionFormValues>;
  fields: readonly FieldDefinition<CountFieldName>[];
}) {
  return fields.map((definition) => (
    <Controller
      key={definition.name}
      control={control}
      name={definition.name}
      render={({ field }) => (
        <CountField
          label={definition.label}
          value={field.value}
          onChange={field.onChange}
          error={getFieldError(errors, definition.name)}
        />
      )}
    />
  ));
}

function BooleanController({
  control,
  name,
  label,
}: {
  control: Control<RecordHiveInspectionFormValues>;
  name: BooleanFieldName;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <BooleanField
          label={label}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}

function getFieldError(
  errors: FieldErrors<RecordHiveInspectionFormValues>,
  name: RatingFieldName | CountFieldName,
) {
  const message = errors[name]?.message;

  return typeof message === "string" ? message : undefined;
}

function optionalText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function toPerformedAt(performedOn: string) {
  const today = formatDateOnly(new Date());

  if (performedOn === today) {
    return new Date().toISOString();
  }

  const [year, month, day] = performedOn.split("-").map(Number);

  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
}

function toRequest(
  values: RecordHiveInspectionFormValues,
): RecordHiveInspectionRequest {
  return {
    performedAt: toPerformedAt(values.performedOn),
    inspectionType: values.inspectionType,
    overallConditionRating: values.overallConditionRating,
    populationRating: values.populationRating,
    temperamentRating: values.temperamentRating,
    colonyStrength: values.colonyStrength,
    beeCoveredFrameCount: values.beeCoveredFrameCount,
    broodFrameCount: values.broodFrameCount,
    honeyFrameCount: values.honeyFrameCount,
    pollenFrameCount: values.pollenFrameCount,
    hasSwarmed: values.hasSwarmed,
    honeyStoresRating: values.honeyStoresRating,
    pollenStoresRating: values.pollenStoresRating,
    broodCoveragePercentage: values.broodCoveragePercentage,
    openBroodFrameCount: values.openBroodFrameCount,
    cappedBroodFrameCount: values.cappedBroodFrameCount,
    broodPattern: values.broodPattern,
    broodStage: values.broodStage,
    droneBroodPresent: values.droneBroodPresent,
    droneBroodExtent: values.droneBroodExtent,
    larvaePresence: values.larvaePresence,
    droneWorkerBalance: values.droneWorkerBalance,
    broodQuality: values.broodQuality,
    queenSeen: values.queenSeen,
    queenMarked: values.queenMarked,
    queenCellCount: values.queenCellCount,
    queenCellStage: values.queenCellStage,
    swarmingTendency: values.swarmingTendency,
    foodStoreAssessment: values.foodStoreAssessment,
    pollenStoreAssessment: values.pollenStoreAssessment,
    starvationRisk: values.starvationRisk,
    varroaLevel: values.varroaLevel,
    disease: values.disease,
    diseaseOther: optionalText(values.diseaseOther),
    pest: values.pest,
    pestOther: optionalText(values.pestOther),
    predator: values.predator,
    predatorOther: optionalText(values.predatorOther),
    moldPresent: values.moldPresent,
    excessMoisturePresent: values.excessMoisturePresent,
    deadBeeLevel: values.deadBeeLevel,
    odor: values.odor,
    imageUrl: null,
    notes: optionalText(values.notes),
  };
}

function applyServerValidationErrors(
  error: unknown,
  setError: (
    name: FieldPath<RecordHiveInspectionFormValues>,
    error: { type: string; message: string },
  ) => void,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) {
    return;
  }

  for (const [serverName, messages] of Object.entries(error.problem.errors)) {
    const candidate =
      serverName.toLowerCase() === "performedat"
        ? "performedOn"
        : `${serverName.charAt(0).toLowerCase()}${serverName.slice(1)}`;

    if (!(candidate in defaultValues) || !messages[0]) {
      continue;
    }

    setError(candidate as FieldPath<RecordHiveInspectionFormValues>, {
      type: "server",
      message: messages[0],
    });
  }
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return "Košnica nije pronađena ili joj više nemate pristup.";
  }

  if (error instanceof ApiError && error.status === 400) {
    return "Proverite označena polja i pokušajte ponovo.";
  }

  return error instanceof Error
    ? error.message
    : "Pregled nije moguće sačuvati. Pokušajte ponovo.";
}
