import {
  zodResolver,
} from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  router,
} from 'expo-router';
import {
  useState,
} from 'react';
import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import {
  useApiaries,
} from '@/features/apiaries/hooks/use-apiaries';
import {
  useCreateLocation,
} from '@/features/apiaries/hooks/use-create-location';
import {
  useCurrentApiaryStay,
} from '@/features/apiaries/hooks/use-current-apiary-stay';
import {
  useLocations,
} from '@/features/apiaries/hooks/use-locations';
import type {
  HiveEntranceOrientation,
} from '@/features/apiaries/types/apiary-stay';
import {
  HiveCard,
} from '@/features/hives/components/hive-card';
import {
  useHives,
} from '@/features/hives/hooks/use-hives';
import {
  useCreateRelocation,
} from '@/features/relocations/hooks/use-create-relocation';
import type {
  CreateRelocationFormValues,
} from '@/features/relocations/schemas/create-relocation-schema';
import {
  createRelocationSchema,
  orientationValues,
  transportMethodValues,
} from '@/features/relocations/schemas/create-relocation-schema';
import type {
  CreateRelocationRequest,
  RelocationKind,
  RelocationTransportMethod,
} from '@/features/relocations/types/create-relocation';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  ApiError,
} from '@/shared/api/api-error';
import type {
  GeographicCoordinates,
} from '@/shared/api/open-topo-data';
import {
  ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';
import {
  DatePickerField,
} from '@/shared/components/date-picker-field';
import {
  MapLocationPicker,
} from '@/shared/components/map-location-picker/map-location-picker';
import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  Screen,
} from '@/shared/components/screen/screen';
import {
  colors,
} from '@/shared/theme/colors';
import {
  formatDateOnly,
  getCurrentUtcDateOnly,
} from '@/shared/utils/date-only';

type CreateRelocationScreenProps = {
  apiaryId: string;
};

type Step = 1 | 2 | 3 | 4;

const steps = [
  'Vrsta',
  'Odredište',
  'Detalji',
  'Pregled',
] as const;

const orientationLabels:
  Record<
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

const transportMethodLabels:
  Record<
    RelocationTransportMethod,
    string
  > = {
    trailer: 'Prikolica',
    truck: 'Kamion',
    van: 'Kombi',
    other: 'Drugo',
  };

function getLocalDateOnly() {
  return formatDateOnly(new Date());
}

function getLocalTime() {
  const now = new Date();
  const hours = String(
    now.getHours(),
  ).padStart(2, '0');
  const minutes = String(
    now.getMinutes(),
  ).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function optionalText(
  value: string,
) {
  const trimmed = value.trim();

  return trimmed || undefined;
}

function parseDecimal(
  value: string,
) {
  return Number(
    value.trim().replace(',', '.'),
  );
}

function parseOptionalInteger(
  value: string,
) {
  const trimmed = value.trim();

  return trimmed
    ? Number(trimmed)
    : null;
}

function toOccurredAtUtc(
  date: string,
  time: string,
) {
  const [year, month, day] =
    date.split('-').map(Number);
  const [hours, minutes] =
    time.split(':').map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
  ).toISOString();
}

function formatCoordinates(
  latitude: number,
  longitude: number,
) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function CreateRelocationScreen({
  apiaryId,
}: CreateRelocationScreenProps) {
  const {
    openDrawer,
  } = useAppDrawer();

  const [
    step,
    setStep,
  ] = useStateStep();

  const [
    createdLocationId,
    setCreatedLocationId,
  ] = useState<string | null>(null);

  const [
    submissionError,
    setSubmissionError,
  ] = useState<string | null>(null);

  const createLocationMutation =
    useCreateLocation();
  const createRelocationMutation =
    useCreateRelocation();

  const {
    control,
    getValues,
    setError,
    setValue,
    clearErrors,
    trigger,
    formState: {
      errors,
    },
  } = useForm<CreateRelocationFormValues>({
    resolver: zodResolver(
      createRelocationSchema,
    ),
    defaultValues: {
      kind: null,
      selectedHiveIds: [],
      destinationMode: 'existing',
      destinationLocationId: null,
      destinationApiaryId: null,
      destinationOrientation: null,
      destinationStayNote: '',
      locationName: '',
      latitude: '',
      longitude: '',
      altitudeMeters: '',
      cadastralParcelNumber: '',
      locationDescription: '',
      occurredAtDate: getLocalDateOnly(),
      occurredAtTime: getLocalTime(),
      transportMethod: null,
      distanceKm: '',
      costAmount: '',
      currencyCode: '',
      notes: '',
    },
  });

  const kind = useWatch({
    control,
    name: 'kind',
  });
  const selectedHiveIds = useWatch({
    control,
    name: 'selectedHiveIds',
  });
  const destinationMode = useWatch({
    control,
    name: 'destinationMode',
  });
  const destinationLocationId = useWatch({
    control,
    name: 'destinationLocationId',
  });
  const destinationApiaryId = useWatch({
    control,
    name: 'destinationApiaryId',
  });
  const destinationOrientation = useWatch({
    control,
    name: 'destinationOrientation',
  });
  const latitude = useWatch({
    control,
    name: 'latitude',
  });
  const longitude = useWatch({
    control,
    name: 'longitude',
  });

  const {
    data: hives = [],
    isLoading: areHivesLoading,
    isError: areHivesError,
    refetch: refetchHives,
  } = useHives(apiaryId);

  const {
    data: apiaries = [],
    isLoading: areApiariesLoading,
    isError: areApiariesError,
    refetch: refetchApiaries,
  } = useApiaries();

  const {
    data: locations = [],
    isLoading: areLocationsLoading,
    isError: areLocationsError,
    refetch: refetchLocations,
  } = useLocations();

  const {
    data: sourceStay,
  } = useCurrentApiaryStay(apiaryId);

  const {
    data: destinationApiaryStay,
  } = useCurrentApiaryStay(
    destinationApiaryId ?? '',
  );

  const isSubmitting =
    createLocationMutation.isPending ||
    createRelocationMutation.isPending;

  const selectedCoordinates =
    latitude.trim() && longitude.trim()
      ? (() => {
        const selectedLatitude =
          parseDecimal(latitude);
        const selectedLongitude =
          parseDecimal(longitude);

        return Number.isFinite(selectedLatitude) &&
          Number.isFinite(selectedLongitude)
          ? {
            latitude: selectedLatitude,
            longitude: selectedLongitude,
          }
          : null;
      })()
      : null;

  const chooseKind = (
    nextKind: RelocationKind,
  ) => {
    setSubmissionError(null);
    setValue('kind', nextKind, {
      shouldValidate: true,
    });

    if (nextKind === 'wholeApiary') {
      setValue('selectedHiveIds', []);
      setValue('destinationApiaryId', null);
    } else {
      setValue('destinationLocationId', null);
      setValue('destinationOrientation', null);
      setValue('destinationStayNote', '');
      setCreatedLocationId(null);
    }
  };

  const toggleHive = (
    hiveId: string,
  ) => {
    setSubmissionError(null);

    const nextIds = selectedHiveIds.includes(hiveId)
      ? selectedHiveIds.filter(
        (id) => id !== hiveId,
      )
      : [
        ...selectedHiveIds,
        hiveId,
      ];

    setValue(
      'selectedHiveIds',
      nextIds,
      {
        shouldValidate: true,
      },
    );
  };

  const validateStepOne = async () => {
    clearErrors([
      'kind',
      'selectedHiveIds',
    ]);

    if (!kind) {
      setError('kind', {
        message:
          'Izaberite vrstu selidbe.',
      });

      return false;
    }

    if (
      kind === 'selectedHives' &&
      selectedHiveIds.length === 0
    ) {
      setError('selectedHiveIds', {
        message:
          'Izaberite najmanje jednu košnicu.',
      });

      return false;
    }

    return true;
  };

  const validateStepTwo = async () => {
    clearErrors([
      'destinationLocationId',
      'destinationApiaryId',
          'destinationOrientation',
          'destinationStayNote',
    ]);

    if (kind === 'wholeApiary') {
      if (!destinationOrientation) {
        setError('destinationOrientation', {
          message:
            'Izaberite novu orijentaciju pčelinjaka.',
        });

        return false;
      }

      if (
        destinationMode === 'existing' &&
        !destinationLocationId
      ) {
        setError('destinationLocationId', {
          message:
            'Izaberite odredišnu lokaciju.',
        });

        return false;
      }

      if (destinationMode === 'new') {
        return trigger([
          'latitude',
          'longitude',
          'altitudeMeters',
          'locationName',
          'cadastralParcelNumber',
          'locationDescription',
          'destinationStayNote',
        ]);
      }

      return true;
    }

    if (!destinationApiaryId) {
      setError('destinationApiaryId', {
        message:
          'Izaberite odredišni pčelinjak.',
      });

      return false;
    }

    return true;
  };

  const validateStepThree = async () => {
    const isShapeValid = await trigger([
      'occurredAtDate',
      'occurredAtTime',
      'transportMethod',
      'distanceKm',
      'costAmount',
      'currencyCode',
      'notes',
    ]);

    const values = getValues();

    if (!values.transportMethod) {
      setError('transportMethod', {
        message:
          'Izaberite način prevoza.',
      });

      return false;
    }

    if (!isShapeValid) {
      return false;
    }

    const occurredAtUtc = toOccurredAtUtc(
      values.occurredAtDate,
      values.occurredAtTime,
    );

    if (
      sourceStay &&
      new Date(occurredAtUtc) <=
        new Date(sourceStay.startedAtUtc)
    ) {
      setError('occurredAtDate', {
        message:
          'Datum i vreme moraju biti posle početka trenutnog boravka pčelinjaka.',
      });

      return false;
    }

    if (
      kind === 'selectedHives' &&
      destinationApiaryStay &&
      new Date(occurredAtUtc) <
        new Date(
          destinationApiaryStay.startedAtUtc,
        )
    ) {
      setError('occurredAtDate', {
        message:
          'Selidba ne može biti pre početka trenutnog boravka odredišnog pčelinjaka.',
      });

      return false;
    }

    return true;
  };

  const moveNext = async () => {
    setSubmissionError(null);

    const canContinue =
      step === 1
        ? await validateStepOne()
        : step === 2
          ? await validateStepTwo()
          : await validateStepThree();

    if (canContinue && step < 4) {
      setStep(
        (step + 1) as Step,
      );
    }
  };

  const movePrevious = () => {
    setSubmissionError(null);

    if (step > 1) {
      setStep(
        (step - 1) as Step,
      );
    }
  };

  const mapApiErrors = (
    error: unknown,
  ) => {
    if (!(error instanceof ApiError)) {
      return false;
    }

    const fieldMap: Partial<
      Record<
        string,
        keyof CreateRelocationFormValues
      >
    > = {
      kind: 'kind',
      destinationLocationId:
        'destinationLocationId',
      destinationApiaryId:
        'destinationApiaryId',
      destinationOrientation:
        'destinationOrientation',
      destinationStayNote:
        'destinationStayNote',
      hiveIds: 'selectedHiveIds',
      occurredAtUtc: 'occurredAtDate',
      transportMethod: 'transportMethod',
      distanceKm: 'distanceKm',
      costAmount: 'costAmount',
      currencyCode: 'currencyCode',
      notes: 'notes',
      latitude: 'latitude',
      longitude: 'longitude',
      altitudeMeters: 'altitudeMeters',
      cadastralParcelNumber:
        'cadastralParcelNumber',
      description: 'locationDescription',
    };

    let hasFieldError = false;

    Object.entries(
      error.problem?.errors ?? {},
    ).forEach(([
      key,
      messages,
    ]) => {
      const normalizedKey =
        key.charAt(0).toLowerCase() +
        key.slice(1);
      const field =
        fieldMap[normalizedKey];

      if (field && messages[0]) {
        setError(field, {
          message: messages[0],
        });
        hasFieldError = true;
      }
    });

    return hasFieldError;
  };

  const confirmRelocation = async () => {
    for (const currentStep of [
      1,
      2,
      3,
    ] as const) {
      const isValid =
        currentStep === 1
          ? await validateStepOne()
          : currentStep === 2
            ? await validateStepTwo()
            : await validateStepThree();

      if (!isValid) {
        setStep(currentStep);
        return;
      }
    }

    const values = getValues();
    setSubmissionError(null);

    try {
      let locationId =
        values.destinationLocationId ??
        undefined;

      if (
        values.kind === 'wholeApiary' &&
        values.destinationMode === 'new'
      ) {
        if (!createdLocationId) {
          const createdLocation =
            await createLocationMutation.mutateAsync({
              name:
                optionalText(
                  values.locationName,
                ) ?? null,
              latitude: parseDecimal(
                values.latitude,
              ),
              longitude: parseDecimal(
                values.longitude,
              ),
              altitudeMeters:
                parseOptionalInteger(
                  values.altitudeMeters,
                ),
              cadastralParcelNumber:
                optionalText(
                  values.cadastralParcelNumber,
                ) ?? null,
              description:
                optionalText(
                  values.locationDescription,
                ) ?? null,
            });

          locationId = createdLocation.id;
          setCreatedLocationId(locationId);
        } else {
          locationId = createdLocationId;
        }
      }

      const request: CreateRelocationRequest = {
        kind: values.kind!,
        sourceApiaryId: apiaryId,
        occurredAtUtc: toOccurredAtUtc(
          values.occurredAtDate,
          values.occurredAtTime,
        ),
        transportMethod:
          values.transportMethod!,
        distanceKm: values.distanceKm
          ? parseDecimal(values.distanceKm)
          : undefined,
        costAmount: values.costAmount
          ? parseDecimal(values.costAmount)
          : undefined,
        currencyCode:
          optionalText(
            values.currencyCode,
          ),
        notes: optionalText(values.notes),
        ...(values.kind === 'wholeApiary'
          ? {
            destinationLocationId: locationId,
            destinationOrientation:
              values.destinationOrientation!,
            destinationStayNote:
              optionalText(
                values.destinationStayNote,
              ),
          }
          : {
            destinationApiaryId:
              values.destinationApiaryId!,
            hiveIds:
              values.selectedHiveIds,
          }),
      };

      await createRelocationMutation.mutateAsync(
        request,
      );

      router.replace('/');
    } catch (error) {
      const hasFieldError =
        mapApiErrors(error);

      setSubmissionError(
        error instanceof Error
          ? error.message
          : hasFieldError
            ? 'Proverite označena polja.'
            : 'Selidbu nije moguće sačuvati.',
      );
    }
  };

  const confirmCancellation = () => {
    Alert.alert(
      'Otkaži selidbu?',
      'Uneti podaci neće biti sačuvani.',
      [
        {
          text: 'Nastavi unos',
          style: 'cancel',
        },
        {
          text: 'Otkaži selidbu',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ],
    );
  };

  const currentTitle =
    kind === 'selectedHives'
      ? 'Selidba košnica'
      : 'Nova selidba';

  return (
    <Screen
      header={
        <AppHeader
          onMenuPress={openDrawer}
        />
      }
      contextualActionBar={
        <ContextualActionBar
          leftActions={[
            {
              key: 'cancel',
              label: 'Otkaži',
              icon: 'close-outline',
              variant: 'danger',
              accessibilityLabel:
                'Otkaži unos selidbe',
              onPress: confirmCancellation,
              disabled: isSubmitting,
            },
          ]}
          primaryAction={{
            key: 'confirm',
            label: 'Potvrdi',
            icon: 'checkmark',
            accessibilityLabel:
              'Potvrdi selidbu',
            onPress: () => {
              void confirmRelocation();
            },
            hidden: step !== 4,
            disabled: isSubmitting,
            loading: isSubmitting,
          }}
          rightActions={[
            {
              key: 'previous',
              label: 'Nazad',
              icon: 'arrow-back-outline',
              accessibilityLabel:
                'Prethodni korak',
              onPress: movePrevious,
              disabled:
                step === 1 ||
                isSubmitting,
            },
            {
              key: 'next',
              label: 'Dalje',
              icon: 'arrow-forward-outline',
              accessibilityLabel:
                'Sledeći korak',
              onPress: () => {
                void moveNext();
              },
              hidden: step === 4,
              disabled: isSubmitting,
            },
          ]}
        />
      }
    >
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 36,
        }}
      >
        <Text
          className="text-2xl font-bold text-foreground"
        >
          {currentTitle}
        </Text>

        <Text
          className="mt-1 text-sm text-muted"
        >
          Korak {step} od {steps.length}
        </Text>

        <StepLegend step={step} />

        {step === 1 && (
          <StepOne
            kind={kind}
            hives={hives}
            isHivesLoading={areHivesLoading}
            isHivesError={areHivesError}
            selectedHiveIds={selectedHiveIds}
            kindError={errors.kind?.message}
            hiveError={
              errors.selectedHiveIds?.message
            }
            onRetryHives={() => {
              void refetchHives();
            }}
            onChooseKind={chooseKind}
            onToggleHive={toggleHive}
          />
        )}

        {step === 2 && kind && (
          <StepTwo
            apiaryId={apiaryId}
            kind={kind}
            destinationMode={destinationMode}
            destinationLocationId={
              destinationLocationId
            }
            destinationApiaryId={
              destinationApiaryId
            }
      destinationOrientation={
              destinationOrientation
            }
            locations={locations}
            apiaries={apiaries}
            sourceLocationId={sourceStay?.locationId}
            isLocationsLoading={areLocationsLoading}
            isLocationsError={areLocationsError}
            isApiariesLoading={areApiariesLoading}
            isApiariesError={areApiariesError}
            errors={errors}
            control={control}
            selectedCoordinates={selectedCoordinates}
            onRetryLocations={() => {
              void refetchLocations();
            }}
            onRetryApiaries={() => {
              void refetchApiaries();
            }}
            onDestinationModeChange={(mode) => {
              setSubmissionError(null);
              setCreatedLocationId(null);
              setValue('destinationMode', mode);

              if (mode === 'new') {
                setValue(
                  'destinationLocationId',
                  null,
                );
              }
            }}
            onDestinationLocationChange={(
              locationId,
            ) => {
              setSubmissionError(null);
              setCreatedLocationId(null);
              setValue(
                'destinationLocationId',
                locationId,
                {
                  shouldValidate: true,
                },
              );
            }}
            onDestinationApiaryChange={(
              selectedApiaryId,
            ) => {
              setSubmissionError(null);
              setValue(
                'destinationApiaryId',
                selectedApiaryId,
                {
                  shouldValidate: true,
                },
              );
            }}
            onOrientationChange={(
              orientation,
            ) => {
              setSubmissionError(null);
              setValue(
                'destinationOrientation',
                orientation,
                {
                  shouldValidate: true,
                },
              );
            }}
            onMapLocationChange={(
              coordinates,
            ) => {
              setSubmissionError(null);
              setCreatedLocationId(null);
              setValue(
                'latitude',
                coordinates.latitude.toFixed(6),
                {
                  shouldValidate: true,
                },
              );
              setValue(
                'longitude',
                coordinates.longitude.toFixed(6),
                {
                  shouldValidate: true,
                },
              );
            }}
            onAltitudeChange={(
              altitudeMeters,
            ) => {
              setCreatedLocationId(null);
              setValue(
                'altitudeMeters',
                altitudeMeters?.toString() ?? '',
                {
                  shouldValidate: true,
                },
              );
            }}
            onNewLocationChange={() => {
              setCreatedLocationId(null);
            }}
          />
        )}

        {step === 3 && (
          <StepThree
            control={control}
            errors={errors}
          />
        )}

        {step === 4 && kind && (
          <StepFour
            kind={kind}
            values={getValues()}
            hives={hives}
            locations={locations}
            apiaries={apiaries}
            createdLocationId={createdLocationId}
            submissionError={submissionError}
          />
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function useStateStep() {
  const [
    step,
    setStep,
  ] = useState<Step>(1);

  return [
    step,
    setStep,
  ] as const;
}

type StepLegendProps = {
  step: Step;
};

function StepLegend({
  step,
}: StepLegendProps) {
  return (
    <View
      className="mb-8 mt-6 flex-row items-start"
    >
      {steps.map((label, index) => {
        const stepNumber =
          (index + 1) as Step;
        const isCurrent =
          stepNumber === step;
        const isComplete =
          stepNumber < step;
        const previousConnectorIsComplete =
          step > stepNumber - 1;
        const nextConnectorIsComplete =
          step > stepNumber;

        return (
          <View
            key={label}
            className="relative flex-1 items-center"
          >
            {index > 0 && (
              <View
                className={`
                  absolute
                  left-0
                  right-1/2
                  top-5
                  h-0.5
                  ${previousConnectorIsComplete
                    ? 'bg-primary'
                    : 'bg-border'
                  }
                `}
              />
            )}

            {index < steps.length - 1 && (
              <View
                className={`
                  absolute
                  left-1/2
                  right-0
                  top-5
                  h-0.5
                  ${nextConnectorIsComplete
                    ? 'bg-primary'
                    : 'bg-border'
                  }
                `}
              />
            )}

            <View
              className="relative z-10 h-10 w-10 items-center justify-center rounded-full bg-background"
            >
              <View
                className={`
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                ${isCurrent || isComplete
                  ? 'bg-primary'
                  : 'bg-border'
                }
              `}
              >
                <Text
                  className={`
                    text-xs
                    font-bold
                    ${isCurrent || isComplete
                      ? 'text-background'
                      : 'text-muted'
                    }
                  `}
                >
                  {isComplete
                    ? '✓'
                    : stepNumber}
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={1}
              className={`
                mt-2
                text-center
                text-[11px]
                font-semibold
                ${isCurrent
                  ? 'text-primary'
                  : 'text-muted'
                }
              `}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type StepOneProps = {
  kind: RelocationKind | null;
  hives: ReturnType<typeof useHives>['data'] extends infer T
    ? NonNullable<T>
    : never;
  isHivesLoading: boolean;
  isHivesError: boolean;
  selectedHiveIds: string[];
  kindError?: string;
  hiveError?: string;
  onRetryHives: () => void;
  onChooseKind: (kind: RelocationKind) => void;
  onToggleHive: (hiveId: string) => void;
};

function StepOne({
  kind,
  hives,
  isHivesLoading,
  isHivesError,
  selectedHiveIds,
  kindError,
  hiveError,
  onRetryHives,
  onChooseKind,
  onToggleHive,
}: StepOneProps) {
  return (
    <View>
      <SectionHeading
        title="Šta selite?"
        description="Izaberite da li menjate lokaciju celog pčelinjaka ili samo određenih košnica."
      />

      <View className="gap-3">
        <SelectionCard
          icon="business-outline"
          title="Ceo pčelinjak"
          description="Pčelinjak prelazi na novu lokaciju sa novom orijentacijom."
          selected={kind === 'wholeApiary'}
          onPress={() => {
            onChooseKind('wholeApiary');
          }}
        />

        <SelectionCard
          icon="cube-outline"
          title="Odabrane košnice"
          description="Samo izabrane aktivne košnice prelaze u drugi pčelinjak."
          selected={kind === 'selectedHives'}
          onPress={() => {
            onChooseKind('selectedHives');
          }}
        />
      </View>

      {kindError && (
        <ErrorText message={kindError} />
      )}

      {kind === 'selectedHives' && (
        <View className="mt-8">
          <Text className="text-lg font-bold text-foreground">
            Aktivne košnice
          </Text>

          <Text className="mt-1 text-sm text-muted">
            Označite košnice koje selite.
          </Text>

          {isHivesLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            </View>
          ) : isHivesError ? (
            <RetryCard
              message="Nije moguće učitati aktivne košnice."
              onRetry={onRetryHives}
            />
          ) : hives.length === 0 ? (
            <EmptyCard message="Pčelinjak trenutno nema aktivne košnice za selidbu." />
          ) : (
            <View className="mt-4 gap-3">
              {hives.map((hive) => (
                <HiveCard
                  key={hive.id}
                  label={hive.label}
                  identificationNumber={
                    hive.identificationNumber
                  }
                  type={hive.type}
                  colorHex={hive.colorHex}
                  status={hive.status}
                  selectionMode
                  selected={selectedHiveIds.includes(hive.id)}
                  onPress={() => {
                    onToggleHive(hive.id);
                  }}
                />
              ))}
            </View>
          )}

          {hiveError && (
            <ErrorText message={hiveError} />
          )}
        </View>
      )}
    </View>
  );
}

type StepTwoProps = {
  apiaryId: string;
  kind: RelocationKind;
  destinationMode: 'existing' | 'new';
  destinationLocationId: string | null;
  destinationApiaryId: string | null;
  destinationOrientation:
    HiveEntranceOrientation | null;
  locations: Array<{
    id: string;
    name: string | null;
    latitude: number;
    longitude: number;
    altitudeMeters: number | null;
    cadastralParcelNumber: string | null;
    description: string | null;
  }>;
  apiaries: Array<{
    id: string;
    name: string | null;
  }>;
  sourceLocationId?: string;
  isLocationsLoading: boolean;
  isLocationsError: boolean;
  isApiariesLoading: boolean;
  isApiariesError: boolean;
  errors: {
    [K in keyof CreateRelocationFormValues]?: {
      message?: string;
    };
  };
  control: ReturnType<
    typeof useForm<CreateRelocationFormValues>
  >['control'];
  selectedCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
  onRetryLocations: () => void;
  onRetryApiaries: () => void;
  onDestinationModeChange: (
    mode: 'existing' | 'new',
  ) => void;
  onDestinationLocationChange: (
    locationId: string,
  ) => void;
  onDestinationApiaryChange: (
    apiaryId: string,
  ) => void;
  onOrientationChange: (
    orientation: HiveEntranceOrientation,
  ) => void;
  onMapLocationChange: (
    coordinates: GeographicCoordinates,
  ) => void;
  onAltitudeChange: (
    altitudeMeters: number | null,
  ) => void;
  onNewLocationChange: () => void;
};

function StepTwo({
  apiaryId,
  kind,
  destinationMode,
  destinationLocationId,
  destinationApiaryId,
  destinationOrientation,
  locations,
  apiaries,
  sourceLocationId,
  isLocationsLoading,
  isLocationsError,
  isApiariesLoading,
  isApiariesError,
  errors,
  control,
  selectedCoordinates,
  onRetryLocations,
  onRetryApiaries,
  onDestinationModeChange,
  onDestinationLocationChange,
  onDestinationApiaryChange,
  onOrientationChange,
  onMapLocationChange,
  onAltitudeChange,
  onNewLocationChange,
}: StepTwoProps) {
  if (kind === 'selectedHives') {
    const destinationApiaries = apiaries.filter(
      (apiary) => apiary.id !== apiaryId,
    );

    return (
      <View>
        <SectionHeading
          title="Odredišni pčelinjak"
          description="Izaberite pčelinjak u koji premeštate odabrane košnice."
        />

        {isApiariesLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        ) : isApiariesError ? (
          <RetryCard
            message="Nije moguće učitati pčelinjake."
            onRetry={onRetryApiaries}
          />
        ) : destinationApiaries.length === 0 ? (
          <EmptyCard message="Potrebno je da imate još jedan aktivan pčelinjak kao odredište." />
        ) : (
          <View className="gap-3">
            {destinationApiaries.map((apiary) => (
              <SelectionCard
                key={apiary.id}
                icon="business-outline"
                title={
                  apiary.name?.trim() ||
                  'Pčelinjak bez naziva'
                }
                description="Odredišni pčelinjak"
                selected={
                  destinationApiaryId === apiary.id
                }
                onPress={() => {
                  onDestinationApiaryChange(apiary.id);
                }}
              />
            ))}
          </View>
        )}

        {errors.destinationApiaryId?.message && (
          <ErrorText
            message={
              errors.destinationApiaryId.message
            }
          />
        )}
      </View>
    );
  }

  const availableLocations = locations.filter(
    (location) => location.id !== sourceLocationId,
  );

  return (
    <View>
      <SectionHeading
        title="Odredišna lokacija"
        description="Izaberite sačuvanu lokaciju ili dodajte novu."
      />

      <View className="flex-row gap-3">
        <Choice
          label="Sačuvana lokacija"
          selected={destinationMode === 'existing'}
          onPress={() => {
            onDestinationModeChange('existing');
          }}
        />

        <Choice
          label="Nova lokacija"
          selected={destinationMode === 'new'}
          onPress={() => {
            onDestinationModeChange('new');
          }}
        />
      </View>

      {destinationMode === 'existing' ? (
        <View className="mt-5">
          {isLocationsLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            </View>
          ) : isLocationsError ? (
            <RetryCard
              message="Nije moguće učitati sačuvane lokacije."
              onRetry={onRetryLocations}
            />
          ) : availableLocations.length === 0 ? (
            <EmptyCard message="Nema druge sačuvane lokacije. Dodajte novu lokaciju." />
          ) : (
            <View className="gap-3">
              {availableLocations.map((location) => (
                <SelectionCard
                  key={location.id}
                  icon="location-outline"
                  title={
                    location.name?.trim() ||
                    'Lokacija bez naziva'
                  }
                  metadata={
                    location.altitudeMeters === null
                      ? null
                      : `${location.altitudeMeters} m n/v`
                  }
                  description={location.description}
                  selected={
                    destinationLocationId === location.id
                  }
                  onPress={() => {
                    onDestinationLocationChange(location.id);
                  }}
                />
              ))}
            </View>
          )}

          {errors.destinationLocationId?.message && (
            <ErrorText
              message={
                errors.destinationLocationId.message
              }
            />
          )}
        </View>
      ) : (
        <NewLocationFields
          control={control}
          errors={errors}
          selectedCoordinates={selectedCoordinates}
          onMapLocationChange={onMapLocationChange}
          onAltitudeChange={onAltitudeChange}
          onChange={onNewLocationChange}
        />
      )}

      <Text className="mb-2 mt-8 text-lg font-bold text-foreground">
        Nova orijentacija leta
      </Text>


      <View className="flex-row flex-wrap gap-2">
        {orientationValues.map((orientation) => (
          <OrientationChoice
            key={orientation}
            label={orientationLabels[orientation]}
            selected={
              destinationOrientation === orientation
            }
            onPress={() => {
              onOrientationChange(orientation);
            }}
          />
        ))}
      </View>

      {errors.destinationOrientation?.message && (
        <ErrorText
          message={
            errors.destinationOrientation.message
          }
        />
      )}
    </View>
  );
}

type NewLocationFieldsProps = {
  control: ReturnType<
    typeof useForm<CreateRelocationFormValues>
  >['control'];
  errors: StepTwoProps['errors'];
  selectedCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
  onMapLocationChange: (
    coordinates: GeographicCoordinates,
  ) => void;
  onAltitudeChange: (
    altitudeMeters: number | null,
  ) => void;
  onChange: () => void;
};

function NewLocationFields({
  control,
  errors,
  selectedCoordinates,
  onMapLocationChange,
  onAltitudeChange,
  onChange,
}: NewLocationFieldsProps) {
  return (
    <View className="mt-6">
      <Text className="mb-1 text-lg font-bold text-foreground">
        Nova lokacija
      </Text>

      <Text className="mb-4 text-sm text-muted">
        Izaberite mesto na mapi ili unesite koordinate ručno.
      </Text>

      <Controller
        control={control}
        name="locationName"
        render={({ field }) => (
          <FormTextInput
            label="Naziv lokacije"
            value={field.value}
            onChangeText={(value) => {
              onChange();
              field.onChange(value);
            }}
            placeholder="npr. Bagremara"
            error={errors.locationName?.message}
          />
        )}
      />

      <MapLocationPicker
        value={selectedCoordinates}
        onLocationChange={onMapLocationChange}
        onAltitudeChange={onAltitudeChange}
        error={
          errors.latitude?.message ??
          errors.longitude?.message
        }
      />

      <Controller
        control={control}
        name="latitude"
        render={({ field }) => (
          <FormTextInput
            label="Geografska širina"
            value={field.value}
            onChangeText={(value) => {
              onChange();
              field.onChange(value);
            }}
            placeholder="npr. 45.250000"
            keyboardType="decimal-pad"
            error={errors.latitude?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="longitude"
        render={({ field }) => (
          <FormTextInput
            label="Geografska dužina"
            value={field.value}
            onChangeText={(value) => {
              onChange();
              field.onChange(value);
            }}
            placeholder="npr. 19.833000"
            keyboardType="decimal-pad"
            error={errors.longitude?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="altitudeMeters"
        render={({ field }) => (
          <FormTextInput
            label="Nadmorska visina (m)"
            value={field.value}
            onChangeText={(value) => {
              onChange();
              field.onChange(value);
            }}
            placeholder="npr. 85"
            keyboardType="numbers-and-punctuation"
            error={errors.altitudeMeters?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="cadastralParcelNumber"
        render={({ field }) => (
          <FormTextInput
            label="Broj katastarske parcele"
            value={field.value}
            onChangeText={(value) => {
              onChange();
              field.onChange(value);
            }}
            placeholder="npr. 1234/2"
            error={
              errors.cadastralParcelNumber?.message
            }
          />
        )}
      />

      <Controller
        control={control}
        name="locationDescription"
        render={({ field }) => (
          <FormTextInput
            label="Opis lokacije"
            value={field.value}
            onChangeText={(value) => {
              onChange();
              field.onChange(value);
            }}
            placeholder="Dodatne informacije o lokaciji..."
            multiline
            error={
              errors.locationDescription?.message
            }
          />
        )}
      />

      <Controller
        control={control}
        name="destinationStayNote"
        render={({ field }) => (
          <FormTextInput
            label="Napomena o boravku"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Dodatna napomena o novom boravku..."
            multiline
            error={errors.destinationStayNote?.message}
          />
        )}
      />
    </View>
  );
}

type StepThreeProps = {
  control: ReturnType<
    typeof useForm<CreateRelocationFormValues>
  >['control'];
  errors: StepTwoProps['errors'];
};

function StepThree({
  control,
  errors,
}: StepThreeProps) {
  return (
    <View>
      <SectionHeading
        title="Detalji selidbe"
        description="Unesite datum, način prevoza i opcione troškove selidbe."
      />

      <Controller
        control={control}
        name="occurredAtDate"
        render={({ field }) => (
          <DatePickerField
            label="Datum selidbe"
            value={field.value}
            onChange={field.onChange}
            maximumDate={getCurrentUtcDateOnly()}
            error={errors.occurredAtDate?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="occurredAtTime"
        render={({ field }) => (
          <FormTextInput
            label="Vreme selidbe"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="npr. 08:30"
            keyboardType="numbers-and-punctuation"
            error={errors.occurredAtTime?.message}
          />
        )}
      />

      <Text className="mb-2 mt-2 text-sm font-semibold text-foreground">
        Način prevoza
      </Text>

      <Controller
        control={control}
        name="transportMethod"
        render={({ field }) => (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {transportMethodValues.map((method) => (
              <Choice
                key={method}
                label={transportMethodLabels[method]}
                selected={field.value === method}
                onPress={() => {
                  field.onChange(method);
                }}
              />
            ))}
          </View>
        )}
      />

      {errors.transportMethod?.message && (
        <ErrorText
          message={errors.transportMethod.message}
        />
      )}

      <Controller
        control={control}
        name="distanceKm"
        render={({ field }) => (
          <FormTextInput
            label="Udaljenost (km)"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="npr. 42,5"
            keyboardType="decimal-pad"
            error={errors.distanceKm?.message}
          />
        )}
      />

      <Text className="mb-3 mt-4 text-lg font-bold text-foreground">
        Trošak
      </Text>

      <Controller
        control={control}
        name="costAmount"
        render={({ field }) => (
          <FormTextInput
            label="Iznos"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="npr. 3500"
            keyboardType="decimal-pad"
            error={errors.costAmount?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="currencyCode"
        render={({ field }) => (
          <FormTextInput
            label="Valuta"
            value={field.value}
            onChangeText={(value) => {
              field.onChange(value.toUpperCase());
            }}
            placeholder="RSD"
            autoCapitalize="characters"
            error={errors.currencyCode?.message}
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
            placeholder="Dodatna napomena o selidbi..."
            multiline
            error={errors.notes?.message}
          />
        )}
      />
    </View>
  );
}

type StepFourProps = {
  kind: RelocationKind;
  values: CreateRelocationFormValues;
  hives: StepOneProps['hives'];
  locations: StepTwoProps['locations'];
  apiaries: StepTwoProps['apiaries'];
  createdLocationId: string | null;
  submissionError: string | null;
};

function StepFour({
  kind,
  values,
  hives,
  locations,
  apiaries,
  createdLocationId,
  submissionError,
}: StepFourProps) {
  const selectedHives = hives.filter((hive) =>
    values.selectedHiveIds.includes(hive.id),
  );

  const selectedLocation = locations.find(
    (location) =>
      location.id === values.destinationLocationId,
  );

  const destinationApiary = apiaries.find(
    (apiary) =>
      apiary.id === values.destinationApiaryId,
  );

  const destinationLabel =
    kind === 'wholeApiary'
      ? values.destinationMode === 'new'
        ? values.locationName.trim() ||
          formatCoordinates(
            parseDecimal(values.latitude),
            parseDecimal(values.longitude),
          )
        : selectedLocation?.name?.trim() ||
          (selectedLocation
            ? formatCoordinates(
              selectedLocation.latitude,
              selectedLocation.longitude,
            )
            : 'Izabrana lokacija')
      : destinationApiary?.name?.trim() ||
        'Izabrani pčelinjak';

  return (
    <View>
      <SectionHeading
        title="Potvrda selidbe"
        description="Pregledajte podatke pre konačne potvrde."
      />

      <View className="rounded-3xl border border-border bg-surface px-5 py-2">
        <SummaryRow
          label="Tip"
          value={
            kind === 'wholeApiary'
              ? 'Ceo pčelinjak'
              : 'Odabrane košnice'
          }
        />

        {kind === 'selectedHives' && (
          <SummaryRow
            label="Košnice"
            value={
              selectedHives.length === 0
                ? 'Nema izabranih'
                : selectedHives
                  .map((hive) => hive.label)
                  .join(', ')
            }
          />
        )}

        <SummaryRow
          label={
            kind === 'wholeApiary'
              ? 'Odredišna lokacija'
              : 'Odredišni pčelinjak'
          }
          value={destinationLabel}
        />

        {kind === 'wholeApiary' && (
          <SummaryRow
            label="Nova orijentacija"
            value={
              values.destinationOrientation
                ? orientationLabels[
                  values.destinationOrientation
                ]
                : 'Nije izabrana'
            }
          />
        )}

        {kind === 'wholeApiary' &&
          values.destinationStayNote && (
            <SummaryRow
              label="Napomena o boravku"
              value={values.destinationStayNote}
            />
          )}

        <SummaryRow
          label="Datum i vreme"
          value={`${values.occurredAtDate} u ${values.occurredAtTime}`}
        />

        <SummaryRow
          label="Prevoz"
          value={
            values.transportMethod
              ? transportMethodLabels[
                values.transportMethod
              ]
              : 'Nije izabran'
          }
        />

        {values.distanceKm && (
          <SummaryRow
            label="Udaljenost"
            value={`${values.distanceKm} km`}
          />
        )}

        {values.costAmount && (
          <SummaryRow
            label="Trošak"
            value={`${values.costAmount} ${values.currencyCode}`}
          />
        )}

        {values.notes && (
          <SummaryRow
            label="Napomena"
            value={values.notes}
          />
        )}
      </View>

      {createdLocationId && (
        <Text className="mt-4 text-sm text-muted">
          Nova lokacija je pripremljena i biće upotrebljena pri potvrdi.
        </Text>
      )}

      {submissionError && (
        <View className="mt-5 rounded-2xl border border-error/30 bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">
            {submissionError}
          </Text>
        </View>
      )}

      <View className="mt-6 rounded-2xl bg-primary/10 px-4 py-4">
        <Text className="text-sm font-semibold text-foreground">
          Potvrdom zatvarate trenutni boravak i evidentirate novi boravak na odredištu.
        </Text>
      </View>
    </View>
  );
}

type SectionHeadingProps = {
  title: string;
  description: string;
};

function SectionHeading({
  title,
  description,
}: SectionHeadingProps) {
  return (
    <View className="mb-5">
      <Text className="text-xl font-bold text-foreground">
        {title}
      </Text>

      <Text className="mt-1 text-sm text-muted">
        {description}
      </Text>
    </View>
  );
}

type SelectionCardProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  metadata?: string | null;
  description?: string | null;
  selected: boolean;
  onPress: () => void;
};

function SelectionCard({
  icon,
  title,
  metadata,
  description,
  selected,
  onPress,
}: SelectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      className={`
        min-h-24
        flex-row
        items-center
        rounded-3xl
        border
        px-4
        py-4
        ${selected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface'
        }
      `}
    >
      <View
        className={`
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          ${selected
            ? 'bg-primary'
            : 'bg-primary/10'
          }
        `}
      >
        <Ionicons
          name={icon}
          size={24}
          color={
            selected
              ? colors.onPrimary
              : colors.primary
          }
        />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-base font-bold text-foreground">
          {title}
        </Text>

        {metadata && (
          <Text className="mt-1 text-sm font-semibold text-muted">
            {metadata}
          </Text>
        )}

        {description && (
          <Text className="mt-1 text-sm text-muted">
            {description}
          </Text>
        )}
      </View>

      <View
        className={`
          ml-3
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          border
          ${selected
            ? 'border-primary bg-primary'
            : 'border-border bg-surface'
          }
        `}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={18}
            color={colors.onPrimary}
          />
        )}
      </View>
    </Pressable>
  );
}

type ChoiceProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Choice({
  label,
  selected,
  onPress,
}: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`
        min-h-12
        flex-1
        items-center
        justify-center
        rounded-2xl
        border
        px-3
        py-3
        ${selected
          ? 'border-primary bg-primary'
          : 'border-border bg-surface'
        }
      `}
    >
      <Text
        className={`
          text-center
          text-sm
          font-semibold
          ${selected
            ? 'text-background'
            : 'text-foreground'
          }
        `}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type OrientationChoiceProps = ChoiceProps;

function OrientationChoice({
  label,
  selected,
  onPress,
}: OrientationChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`
        min-w-[47%]
        flex-1
        items-center
        rounded-2xl
        border
        px-3
        py-3
        ${selected
          ? 'border-primary bg-primary'
          : 'border-border bg-surface'
        }
      `}
    >
      <Text
        className={`
          text-sm
          font-semibold
          ${selected
            ? 'text-background'
            : 'text-foreground'
          }
        `}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type FormTextInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?:
    | 'default'
    | 'decimal-pad'
    | 'numbers-and-punctuation';
  autoCapitalize?:
    | 'none'
    | 'sentences'
    | 'words'
    | 'characters';
};

function FormTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FormTextInputProps) {
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
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={
          multiline
            ? 'top'
            : 'center'
        }
        className={`
          rounded-2xl
          border
          bg-surface
          px-4
          text-base
          text-foreground
          ${multiline
            ? 'min-h-28 py-3'
            : 'h-14'
          }
          ${error
            ? 'border-error'
            : 'border-border'
          }
        `}
      />

      {error && (
        <ErrorText message={error} />
      )}
    </View>
  );
}

type ErrorTextProps = {
  message: string;
};

function ErrorText({
  message,
}: ErrorTextProps) {
  return (
    <Text className="mt-2 text-sm text-error">
      {message}
    </Text>
  );
}

type EmptyCardProps = {
  message: string;
};

function EmptyCard({
  message,
}: EmptyCardProps) {
  return (
    <View className="mt-4 rounded-3xl border border-border bg-surface px-5 py-7">
      <Text className="text-center text-sm text-muted">
        {message}
      </Text>
    </View>
  );
}

type RetryCardProps = {
  message: string;
  onRetry: () => void;
};

function RetryCard({
  message,
  onRetry,
}: RetryCardProps) {
  return (
    <View className="mt-4 items-center rounded-3xl border border-error/30 bg-surface px-5 py-7">
      <Text className="text-center text-sm text-error">
        {message}
      </Text>

      <Pressable
        onPress={onRetry}
        className="mt-4 rounded-2xl bg-primary px-5 py-3"
      >
        <Text className="font-bold text-background">
          Pokušaj ponovo
        </Text>
      </Pressable>
    </View>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <View className="border-b border-border py-4 last:border-b-0">
      <Text className="text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </Text>

      <Text className="mt-1 text-base font-semibold text-foreground">
        {value}
      </Text>
    </View>
  );
}
