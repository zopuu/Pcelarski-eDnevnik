import Ionicons from "@react-native-vector-icons/ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useCreateForageProfile } from "../hooks/use-create-forage-profile";
import {
  createForageProfileItemSchema,
  createForageProfileSchema,
  type CreateForageProfileFormInput,
  type CreateForageProfileFormValues,
  type CreateForageProfileItemFormInput,
  type CreateForageProfileItemFormValues,
  type SelectableForageType,
} from "../schemas/create-forage-profile-schema";
import type { CreateForageProfileRequest } from "../types/forage-profile";

import { ApiError } from "@/shared/api/api-error";
import { colors } from "@/shared/theme/colors";

type CreateForageProfileScreenProps = { apiaryId: string };

type ForageTypeOption = {
  value: SelectableForageType;
  label: string;
};

const forageTypeOptions: ForageTypeOption[] = [
  { value: "meadow", label: "Livada" },
  { value: "forest", label: "Šuma" },
  { value: "sunflower", label: "Suncokret" },
  { value: "acacia", label: "Bagrem" },
  { value: "linden", label: "Lipa" },
  { value: "oilseedRape", label: "Uljana repica" },
  { value: "clover", label: "Detelina" },
  { value: "fruitTrees", label: "Voćke" },
  { value: "chestnut", label: "Kesten" },
  { value: "buckwheat", label: "Heljda" },
];

const forageTypeLabels = Object.fromEntries(
  forageTypeOptions.map((option) => [option.value, option.label]),
) as Record<SelectableForageType, string>;

const emptyItemDraft: CreateForageProfileItemFormInput = {
  forageType: null,
  percentage: "",
  intensity: 3,
  notes: "",
};

function optionalText(value: string): string | null {
  return value.trim() || null;
}

function getTotalPercentage(items: CreateForageProfileFormInput["items"]) {
  const total = items.reduce((sum, item) => {
    const percentage = Number(item.percentage.replace(",", "."));
    return Number.isFinite(percentage) ? sum + percentage : sum;
  }, 0);

  return Math.round((total + Number.EPSILON) * 100) / 100;
}

function getCreateErrorMessage(error: unknown) {
  if (
    error instanceof ApiError &&
    error.problem?.code ===
      "forage_profiles.current_stay_year_already_has_profile"
  ) {
    return "Profil paše za izabranu godinu već postoji.";
  }

  return "Profil paše nije moguće sačuvati. Pokušajte ponovo.";
}

export function CreateForageProfileScreen({
  apiaryId,
}: CreateForageProfileScreenProps) {
  const createMutation = useCreateForageProfile(apiaryId);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<
    CreateForageProfileFormInput,
    unknown,
    CreateForageProfileFormValues
  >({
    resolver: zodResolver(createForageProfileSchema),
    defaultValues: {
      year: String(new Date().getFullYear()),
      radiusKm: "",
      name: "",
      notes: "",
      items: [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });
  const selectedForageTypes = new Set(
    items
      .map((item) => item.forageType)
      .filter((value): value is SelectableForageType => value !== null),
  );
  const totalPercentage = getTotalPercentage(items);
  const isTotalOverLimit = totalPercentage > 100;
  const missingPercentage = Math.max(0, 100 - totalPercentage);

  const onSubmit = async (values: CreateForageProfileFormValues) => {
    const request: CreateForageProfileRequest = {
      year: values.year,
      radiusKm: values.radiusKm,
      name: values.name,
      notes: optionalText(values.notes),
      items: values.items.map((item) => ({
        forageType: item.forageType,
        percentage: item.percentage,
        intensity: item.intensity,
        notes: optionalText(item.notes),
      })),
    };

    try {
      await createMutation.mutateAsync(request);
      router.replace({
        pathname: "/apiaries/[apiaryId]/forage-profiles",
        params: { apiaryId },
      } as never);
    } catch {
      // The recoverable mutation error is shown below the form.
    }
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[9]}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="mb-5 self-start py-2"
        >
          <Text className="text-base font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">
          Novi profil paše
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Unesite zastupljenost paše u okolini pčelinjaka.
        </Text>

        <SectionTitle>Osnovni podaci</SectionTitle>
        <Controller
          control={control}
          name="year"
          render={({ field }) => (
            <FormTextInput
              label="Godina *"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="number-pad"
              maxLength={4}
              error={errors.year?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextInput
              label="Naziv profila *"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="npr. Prolećna paša"
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="radiusKm"
          render={({ field }) => (
            <FormTextInput
              label="Poluprečnik (km)"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="1–4"
              keyboardType="number-pad"
              maxLength={1}
              error={errors.radiusKm?.message}
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
              placeholder="Dodajte napomenu..."
              multiline
              error={errors.notes?.message}
            />
          )}
        />

        <View className="mb-3 mt-5 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">
              Vrste paše
            </Text>
            <Text className="mt-1 text-sm text-muted">
              Dodajte vrste jednu po jednu. Ostalo se automatski dopunjava do
              100%.
            </Text>
          </View>
          <View
            className={`rounded-full px-3 py-1.5 ${isTotalOverLimit ? "bg-error/10" : "bg-primary/10"}`}
          >
            <Text
              className={`text-xs font-bold ${isTotalOverLimit ? "text-error" : "text-primary"}`}
            >
              {totalPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>

        <ForageItemDraftForm
          selectedForageTypes={selectedForageTypes}
          onAdd={(item) => {
            append({
              forageType: item.forageType,
              percentage: String(item.percentage),
              intensity: item.intensity,
              notes: item.notes,
            });
          }}
        />

        {isTotalOverLimit && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3">
            <Text className="font-semibold text-error">
              Ukupno je {totalPercentage.toFixed(2)}%.
            </Text>
            <Text className="mt-1 text-sm text-error">
              Zbir procenata mora biti najviše 100%. Uklonite ili smanjite neku
              stavku pre kreiranja profila.
            </Text>
          </View>
        )}
        {errors.items?.message && !isTotalOverLimit && (
          <Text className="mb-3 text-sm text-error">
            {errors.items.message}
          </Text>
        )}

        {items.length > 0 && (
          <>
            <Text className="mb-3 mt-4 text-base font-bold text-foreground">
              Dodate vrste
            </Text>
            <View className="mb-4 overflow-hidden rounded-3xl border border-border bg-surface">
              {items.map(
                (item, index) =>
                  item.forageType && (
                    <AddedForageItem
                      key={fields[index]?.id ?? index}
                      forageType={item.forageType}
                      percentage={item.percentage}
                      intensity={item.intensity}
                      notes={item.notes}
                      isLast={index === items.length - 1}
                      onRemove={() => remove(index)}
                    />
                  ),
              )}
            </View>
          </>
        )}

        {!isTotalOverLimit && missingPercentage > 0 && items.length > 0 && (
          <View className="mb-4 rounded-2xl bg-primary/10 px-4 py-3">
            <Text className="text-sm text-foreground">
              Server će dodati „Ostalo“ sa {missingPercentage.toFixed(2)}%.
            </Text>
          </View>
        )}
        {createMutation.isError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-surface px-4 py-3">
            <Text className="text-sm text-error">
              {getCreateErrorMessage(createMutation.error)}
            </Text>
          </View>
        )}
        <Pressable
          disabled={createMutation.isPending}
          onPress={() => {
            if (!isTotalOverLimit) {
              void handleSubmit(onSubmit)();
            }
          }}
          className={`min-h-14 items-center justify-center rounded-2xl px-5 ${isTotalOverLimit ? "bg-error" : "bg-primary"} ${createMutation.isPending ? "opacity-60" : ""}`}
        >
          <Text className="text-base font-bold text-background">
            {isTotalOverLimit
              ? "Ispravite zbir procenata"
              : createMutation.isPending
                ? "Čuvanje..."
                : "Kreiraj profil paše"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function ForageItemDraftForm({
  selectedForageTypes,
  onAdd,
}: {
  selectedForageTypes: Set<SelectableForageType>;
  onAdd: (item: CreateForageProfileItemFormValues) => void;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    CreateForageProfileItemFormInput,
    unknown,
    CreateForageProfileItemFormValues
  >({
    resolver: zodResolver(createForageProfileItemSchema),
    defaultValues: emptyItemDraft,
  });

  return (
    <View className="mb-4 rounded-3xl border border-primary/30 bg-surface p-4">
      <Text className="text-base font-bold text-foreground">
        Dodaj vrstu paše
      </Text>
      <Text className="mb-4 mt-1 text-sm text-muted">
        Izabrana vrsta se više neće nuditi u sledećoj stavci.
      </Text>
      <Controller
        control={control}
        name="forageType"
        render={({ field }) => (
          <ForageTypePicker
            value={field.value}
            onChange={field.onChange}
            selectedForageTypes={selectedForageTypes}
            error={errors.forageType?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="percentage"
        render={({ field }) => (
          <FormTextInput
            label="Zastupljenost (%) *"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="npr. 40"
            keyboardType="decimal-pad"
            error={errors.percentage?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="intensity"
        render={({ field }) => (
          <IntensityPicker value={field.value} onChange={field.onChange} />
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
            placeholder="Opcionalno"
            multiline
            error={errors.notes?.message}
          />
        )}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dodaj vrstu paše u profil"
        onPress={handleSubmit((item) => {
          onAdd(item);
          reset(emptyItemDraft);
        })}
        className="min-h-14 items-center justify-center rounded-2xl bg-primary px-5"
      >
        <Text className="text-base font-bold text-background">
          Dodaj u profil
        </Text>
      </Pressable>
    </View>
  );
}

function AddedForageItem({
  forageType,
  percentage,
  intensity,
  notes,
  isLast,
  onRemove,
}: {
  forageType: SelectableForageType;
  percentage: string;
  intensity: number;
  notes: string;
  isLast: boolean;
  onRemove: () => void;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-4 ${isLast ? "" : "border-b border-border"}`}
    >
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-base font-bold text-foreground">
            {forageTypeLabels[forageType]}
          </Text>
          <Text className="text-base font-bold text-primary">
            {percentage}%
          </Text>
        </View>
        <Text className="mt-1 text-sm text-muted">Jačina: {intensity}/5</Text>
        {notes && <Text className="mt-1 text-sm text-muted">{notes}</Text>}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ukloni ${forageTypeLabels[forageType]} iz profila`}
        onPress={onRemove}
        className="min-h-11 min-w-11 items-center justify-center rounded-full bg-error/10"
      >
        <Ionicons name="close" size={20} color={colors.error} />
      </Pressable>
    </View>
  );
}

function ForageTypePicker({
  value,
  onChange,
  selectedForageTypes,
  error,
}: {
  value: SelectableForageType | null;
  onChange: (value: SelectableForageType) => void;
  selectedForageTypes: Set<SelectableForageType>;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        Vrsta *
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {forageTypeOptions.map((option) => {
          const isSelected = value === option.value;
          const isAlreadyAdded = selectedForageTypes.has(option.value);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{
                selected: isSelected,
                disabled: isAlreadyAdded,
              }}
              disabled={isAlreadyAdded}
              onPress={() => onChange(option.value)}
              className={`min-h-11 items-center justify-center rounded-xl border px-3 ${isSelected ? "border-primary bg-primary" : "border-border bg-background"} ${isAlreadyAdded ? "opacity-40" : ""}`}
            >
              <Text
                className={`text-sm font-semibold ${isSelected ? "text-background" : "text-foreground"}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

function IntensityPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        Jačina paše *
      </Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((intensity) => {
          const isSelected = value === intensity;
          return (
            <Pressable
              key={intensity}
              accessibilityRole="button"
              accessibilityLabel={`Jačina ${intensity}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(intensity)}
              className={`min-h-12 flex-1 items-center justify-center rounded-xl border ${isSelected ? "border-primary bg-primary" : "border-border bg-background"}`}
            >
              <Text
                className={`font-bold ${isSelected ? "text-background" : "text-foreground"}`}
              >
                {intensity}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FormTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  multiline = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
  maxLength?: number;
  multiline?: boolean;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`${multiline ? "min-h-28 py-3" : "h-14"} rounded-2xl border bg-surface px-4 text-base text-foreground ${error ? "border-error" : "border-border"}`}
      />
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-3 mt-8 text-lg font-bold text-foreground">
      {children}
    </Text>
  );
}
