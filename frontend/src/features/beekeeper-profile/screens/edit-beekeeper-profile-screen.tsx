import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { ProfileTextInput } from '@/features/beekeeper-profile/components/profile-text-input';
import { useMyProfile } from '@/features/beekeeper-profile/hooks/use-my-profile';
import { useUpdateMyProfile } from '@/features/beekeeper-profile/hooks/use-update-my-profile';
import {
  updateMyProfileSchema,
  type UpdateMyProfileFormValues,
} from '@/features/beekeeper-profile/schemas/update-my-profile-schema';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

function optionalText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function getFieldError(error: unknown, field: string) {
  if (!(error instanceof ApiError)) {
    return undefined;
  }

  const entry = Object.entries(error.problem?.errors ?? {}).find(
    ([key]) => key.toLocaleLowerCase('en-US') === field.toLocaleLowerCase('en-US'),
  );

  return entry?.[1]?.[0];
}

function getUpdateErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const code = error.problem?.code;

    if (code === 'identity.email_already_exists') {
      return 'Email adresa je već u upotrebi.';
    }

    if (code === 'beekeeper_profiles.hid_already_exists') {
      return 'HID je već u upotrebi.';
    }

    if (code === 'beekeeper_profiles.agricultural_holding_number_already_exists') {
      return 'Broj poljoprivrednog gazdinstva je već u upotrebi.';
    }
  }

  return 'Podatke nije moguće ažurirati. Pokušajte ponovo.';
}

export function EditBeekeeperProfileScreen() {
  const { openDrawer } = useAppDrawer();
  const profileQuery = useMyProfile();
  const currentUserQuery = useCurrentUser();
  const updateMutation = useUpdateMyProfile();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateMyProfileFormValues>({
    resolver: zodResolver(updateMyProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      hid: '',
      phone: '',
      agriculturalHoldingNumber: '',
    },
  });

  useEffect(() => {
    if (!profileQuery.data || !currentUserQuery.data) {
      return;
    }

    reset({
      firstName: profileQuery.data.firstName,
      lastName: profileQuery.data.lastName,
      email: currentUserQuery.data.email ?? '',
      hid: profileQuery.data.hid ?? '',
      phone: profileQuery.data.phone ?? '',
      agriculturalHoldingNumber: profileQuery.data.agriculturalHoldingNumber?.toString() ?? '',
    });
  }, [currentUserQuery.data, profileQuery.data, reset]);

  const onSubmit = async (values: UpdateMyProfileFormValues) => {
    try {
      await updateMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        hid: optionalText(values.hid),
        phone: optionalText(values.phone),
        agriculturalHoldingNumber: values.agriculturalHoldingNumber
          ? Number(values.agriculturalHoldingNumber)
          : null,
      });

      router.back();
    } catch (error) {
      const fields = [
        'firstName',
        'lastName',
        'email',
        'hid',
        'phone',
        'agriculturalHoldingNumber',
      ] as const;

      fields.forEach((field) => {
        const message = getFieldError(error, field);

        if (message) {
          setError(field, {
            type: 'server',
            message,
          });
        }
      });
    }
  };

  const header = <AppHeader onMenuPress={openDrawer} />;

  if (profileQuery.isLoading || currentUserQuery.isLoading) {
    return (
      <Screen header={header}>
        <LoadingState />
      </Screen>
    );
  }

  if (
    profileQuery.isError ||
    currentUserQuery.isError ||
    !profileQuery.data ||
    !currentUserQuery.data
  ) {
    return (
      <Screen header={header}>
        <LoadError />
      </Screen>
    );
  }

  return (
    <Screen header={header}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 48,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na profil"
          onPress={() => {
            router.back();
          }}
          className="
            mb-5
            self-start
            py-2
          "
        >
          <Text
            className="
              text-base
              font-semibold
              text-primary
            "
          >
            ← Profil
          </Text>
        </Pressable>

        <Text
          className="
            text-2xl
            font-bold
            text-foreground
          "
        >
          Izmeni podatke
        </Text>

        <Text className="mt-1 text-sm text-muted">
          Ažurirajte osnovne i kontakt podatke profila.
        </Text>

        <Text
          className="
            mb-3
            mt-8
            text-lg
            font-bold
            text-foreground
          "
        >
          Osnovni podaci
        </Text>

        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <ProfileTextInput
              label="Ime"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="words"
              autoComplete="given-name"
              error={errors.firstName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <ProfileTextInput
              label="Prezime"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="words"
              autoComplete="family-name"
              error={errors.lastName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="hid"
          render={({ field }) => (
            <ProfileTextInput
              label="HID"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="characters"
              error={errors.hid?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="agriculturalHoldingNumber"
          render={({ field }) => (
            <ProfileTextInput
              label="Broj poljoprivrednog gazdinstva"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              error={errors.agriculturalHoldingNumber?.message}
            />
          )}
        />

        <Text
          className="
            mb-3
            mt-4
            text-lg
            font-bold
            text-foreground
          "
        >
          Kontakt podaci
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <ProfileTextInput
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <ProfileTextInput
              label="Telefon"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoComplete="tel"
              keyboardType="phone-pad"
              error={errors.phone?.message}
            />
          )}
        />

        {updateMutation.isError && (
          <View
            className="
              mb-4
              rounded-2xl
              border
              border-error/30
              bg-surface
              px-4
              py-3
            "
          >
            <Text className="text-sm text-error">
              {getUpdateErrorMessage(updateMutation.error)}
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sačuvaj izmene profila"
          disabled={updateMutation.isPending || !isDirty}
          onPress={handleSubmit(onSubmit)}
          className={`
            min-h-14
            items-center
            justify-center
            rounded-2xl
            bg-primary
            px-5
            ${updateMutation.isPending || !isDirty ? 'opacity-60' : ''}
          `}
        >
          <Text
            className="
              text-base
              font-bold
              text-background
            "
          >
            {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function LoadingState() {
  return (
    <View
      className="
        flex-1
        items-center
        justify-center
      "
    >
      <ActivityIndicator size="large" color={colors.primary} />

      <Text className="mt-3 text-muted">Učitavanje profila...</Text>
    </View>
  );
}

function LoadError() {
  return (
    <View
      className="
        flex-1
        items-center
        justify-center
        px-8
      "
    >
      <Text
        className="
          text-center
          text-base
          font-semibold
          text-error
        "
      >
        Nije moguće učitati podatke profila.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Vrati se na profil"
        onPress={() => {
          router.back();
        }}
        className="
          mt-5
          rounded-2xl
          bg-primary
          px-5
          py-3
        "
      >
        <Text className="font-bold text-background">Nazad</Text>
      </Pressable>
    </View>
  );
}
