import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useEffect, useState } from 'react';

import { ObservationPhotoPicker } from '../components/observation-photo-picker';
import type { ObservationPhotoDraft } from '../components/observation-photo-picker';
import { useCreateForageObservation } from '../hooks/use-create-forage-observation';
import { useForageObservation } from '../hooks/use-forage-observation';
import { useUpdateForageObservation } from '../hooks/use-update-forage-observation';
import { createForageObservationSchema } from '../schemas/create-forage-observation-schema';
import type {
  CreateForageObservationFormInput,
  CreateForageObservationFormValues,
  ObservationForageType,
} from '../schemas/create-forage-observation-schema';
import type { CreateForageObservationRequest } from '../types/forage-observation';
import { ApiError } from '@/shared/api/api-error';
import type { GeographicCoordinates } from '@/shared/api/open-topo-data';
import { MapLocationPicker } from '@/shared/components/map-location-picker/map-location-picker';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

const forageTypeOptions: {
  value: ObservationForageType;
  label: string;
}[] = [
  { value: 'meadow', label: 'Livada' },
  { value: 'forest', label: 'Šuma' },
  { value: 'sunflower', label: 'Suncokret' },
  { value: 'acacia', label: 'Bagrem' },
  { value: 'linden', label: 'Lipa' },
  { value: 'oilseedRape', label: 'Uljana repica' },
  { value: 'clover', label: 'Detelina' },
  { value: 'fruitTrees', label: 'Voćke' },
  { value: 'chestnut', label: 'Kesten' },
  { value: 'buckwheat', label: 'Heljda' },
  { value: 'other', label: 'Ostalo' },
];

function optionalText(value: string) {
  return value.trim() || null;
}

function parseSelectedCoordinate(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const coordinate = Number(value.trim().replace(',', '.'));

  return Number.isFinite(coordinate) ? coordinate : null;
}

function getCreateErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 400) {
    return 'Proverite unete podatke i pokušajte ponovo.';
  }

  return 'Zapažanje nije moguće sačuvati. Pokušajte ponovo.';
}

type CreateForageObservationScreenProps = {
  observationId?: string;
};

export function CreateForageObservationScreen({
  observationId,
}: CreateForageObservationScreenProps) {
  const isEditing = Boolean(observationId);
  const createMutation = useCreateForageObservation();
  const observationQuery = useForageObservation(observationId);
  const updateMutation = useUpdateForageObservation(observationId ?? '');
  const [photo, setPhoto] = useState<ObservationPhotoDraft | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateForageObservationFormInput, unknown, CreateForageObservationFormValues>({
    resolver: zodResolver(createForageObservationSchema),
    defaultValues: {
      forageType: null,
      intensity: 3,
      notes: '',
      latitude: '',
      longitude: '',
    },
  });

  const latitude = useWatch({
    control,
    name: 'latitude',
  });
  const longitude = useWatch({
    control,
    name: 'longitude',
  });
  const latitudeNumber = parseSelectedCoordinate(latitude);
  const longitudeNumber = parseSelectedCoordinate(longitude);
  const selectedLocation =
    latitudeNumber !== null && longitudeNumber !== null
      ? {
          latitude: latitudeNumber,
          longitude: longitudeNumber,
        }
      : null;

  const handleLocationChange = (coordinates: GeographicCoordinates) => {
    setValue('latitude', coordinates.latitude.toFixed(6), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('longitude', coordinates.longitude.toFixed(6), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (!observationQuery.data) {
      return;
    }

    reset({
      forageType: observationQuery.data.forageType,
      intensity: observationQuery.data.intensity,
      notes: observationQuery.data.notes ?? '',
      latitude: observationQuery.data.latitude.toFixed(6),
      longitude: observationQuery.data.longitude.toFixed(6),
    });
  }, [observationQuery.data, reset]);

  const onSubmit = async (values: CreateForageObservationFormValues) => {
    const request: CreateForageObservationRequest = {
      observedAt: new Date().toISOString(),
      forageType: values.forageType!,
      intensity: values.intensity,
      notes: optionalText(values.notes),
      latitude: values.latitude,
      longitude: values.longitude,
      image: photo,
    };

    try {
      const response = isEditing
        ? await updateMutation.mutateAsync({
            ...request,
            observedAt: observationQuery.data?.observedAt ?? request.observedAt,
          })
        : await createMutation.mutateAsync(request);

      router.replace(
        isEditing
          ? (`/forage-observations/${response.id}` as never)
          : ('/forage-observations' as never),
      );
    } catch {
      // The recoverable server error remains visible beneath the form.
    }
  };

  const isSaving = isEditing ? updateMutation.isPending : createMutation.isPending;
  const mutationError = isEditing ? updateMutation.error : createMutation.error;

  if (isEditing && observationQuery.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Učitavanje zapažanja...</Text>
        </View>
      </Screen>
    );
  }

  if (isEditing && (observationQuery.isError || !observationQuery.data)) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-error">Zapažanje nije moguće učitati.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 48,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na zapažanja"
          onPress={() => router.back()}
          className="mb-5 self-start py-2"
        >
          <Text className="text-base font-semibold text-primary">← Zapažanja</Text>
        </Pressable>

        <Text className="text-2xl font-bold tracking-tight text-foreground">
          {isEditing ? 'Izmeni zapažanje' : 'Novo zapažanje'}
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Izaberite vrstu paše i označite mesto na kom ste je primetili.
        </Text>

        <SectionTitle>Vrsta i jačina</SectionTitle>
        <Controller
          control={control}
          name="forageType"
          render={({ field }) => (
            <ForageTypePicker
              value={field.value}
              onChange={field.onChange}
              error={errors.forageType?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="intensity"
          render={({ field }) => <IntensityPicker value={field.value} onChange={field.onChange} />}
        />

        <MapLocationPicker
          value={selectedLocation}
          onLocationChange={handleLocationChange}
          onAltitudeChange={() => {
            // Altitude is not persisted for a forage observation.
          }}
          error={errors.latitude?.message ?? errors.longitude?.message}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormTextInput
              label="Napomena"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Dodajte zapažanje sa terena..."
              multiline
              error={errors.notes?.message}
            />
          )}
        />

        <ObservationPhotoPicker
          value={photo}
          imageUrl={observationQuery.data?.imageUrl}
          onChange={(nextPhoto) => {
            setPhoto(nextPhoto);
          }}
        />

        {mutationError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3">
            <Text className="text-sm text-error">{getCreateErrorMessage(mutationError)}</Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sačuvaj zapažanje"
          disabled={isSaving}
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
          className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${isSaving ? 'opacity-60' : ''}`}
        >
          <Text className="text-base font-bold text-background">
            {isSaving ? 'Čuvanje...' : isEditing ? 'Sačuvaj izmene' : 'Sačuvaj zapažanje'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function ForageTypePicker({
  value,
  onChange,
  error,
}: {
  value: ObservationForageType | null;
  onChange: (value: ObservationForageType) => void;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">Vrsta paše *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {forageTypeOptions.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{
                selected: isSelected,
              }}
              onPress={() => onChange(option.value)}
              className={`min-h-11 items-center justify-center rounded-xl border px-3 ${isSelected ? 'border-primary bg-primary' : 'border-border bg-surface'}`}
            >
              <Text
                className={`text-sm font-semibold ${isSelected ? 'text-background' : 'text-foreground'}`}
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
      <Text className="mb-2 text-sm font-semibold text-foreground">Jačina paše *</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((intensity) => {
          const isSelected = intensity === value;

          return (
            <Pressable
              key={intensity}
              accessibilityRole="button"
              accessibilityLabel={`Jačina ${intensity}`}
              accessibilityState={{
                selected: isSelected,
              }}
              onPress={() => onChange(intensity)}
              className={`min-h-12 flex-1 items-center justify-center rounded-xl border ${isSelected ? 'border-primary bg-primary' : 'border-border bg-surface'}`}
            >
              <Text className={`font-bold ${isSelected ? 'text-background' : 'text-foreground'}`}>
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
  keyboardType = 'default',
  multiline = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad';
  multiline?: boolean;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`${multiline ? 'min-h-28 py-3' : 'h-14'} rounded-2xl border bg-surface px-4 text-base text-foreground ${error ? 'border-error' : 'border-border'}`}
      />
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-3 mt-8 text-lg font-bold text-foreground">{children}</Text>;
}
