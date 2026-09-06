import {
  zodResolver,
} from '@hookform/resolvers/zod';
import {
  router,
} from 'expo-router';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import {
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import {
  ProfileTextInput,
} from '@/features/beekeeper-profile/components/profile-text-input';
import {
  useChangePassword,
} from '@/features/beekeeper-profile/hooks/use-change-password';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/beekeeper-profile/schemas/change-password-schema';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  ApiError,
} from '@/shared/api/api-error';
import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  Screen,
} from '@/shared/components/screen/screen';

function getFieldError(
  error: unknown,
  field: string,
) {
  if (!(error instanceof ApiError)) {
    return undefined;
  }

  const entry = Object.entries(
    error.problem?.errors ?? {},
  ).find(([key]) =>
    key.toLocaleLowerCase('en-US') ===
    field.toLocaleLowerCase('en-US'),
  );

  return entry?.[1]?.[0];
}

export function ChangePasswordScreen() {
  const {
    openDrawer,
  } = useAppDrawer();
  const changePasswordMutation =
    useChangePassword();

  const {
    control,
    handleSubmit,
    setError,
    formState: {
      errors,
    },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (
    values: ChangePasswordFormValues,
  ) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      Alert.alert(
        'Lozinka je promenjena',
        'Nova lozinka je uspešno sačuvana.',
        [
          {
            text: 'U redu',
            onPress: () => {
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      const currentPasswordError = getFieldError(
        error,
        'currentPassword',
      );
      const newPasswordError = getFieldError(
        error,
        'newPassword',
      );

      if (currentPasswordError) {
        setError('currentPassword', {
          type: 'server',
          message: 'Trenutna lozinka nije ispravna.',
        });
      }

      if (newPasswordError) {
        setError('newPassword', {
          type: 'server',
          message:
            'Nova lozinka ne ispunjava bezbednosne zahteve.',
        });
      }
    }
  };

  return (
    <Screen
      header={
        <AppHeader
          onMenuPress={openDrawer}
        />
      }
    >
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
          Promeni lozinku
        </Text>

        <Text className="mt-1 text-sm text-muted">
          Unesite trenutnu lozinku, zatim novu lozinku za nalog.
        </Text>

        <View
          className="
            mt-8
            rounded-3xl
            border
            border-border
            bg-surface
            p-4
          "
        >
          <Controller
            control={control}
            name="currentPassword"
            render={({ field }) => (
              <ProfileTextInput
                label="Trenutna lozinka"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="none"
                autoComplete="current-password"
                secureTextEntry
                error={errors.currentPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field }) => (
              <ProfileTextInput
                label="Nova lozinka"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="none"
                autoComplete="new-password"
                secureTextEntry
                error={errors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmNewPassword"
            render={({ field }) => (
              <ProfileTextInput
                label="Potvrda nove lozinke"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="none"
                autoComplete="new-password"
                secureTextEntry
                error={errors.confirmNewPassword?.message}
              />
            )}
          />

          {changePasswordMutation.isError &&
            !errors.currentPassword &&
            !errors.newPassword && (
            <Text
              className="
                mb-4
                text-sm
                text-error
              "
            >
              Lozinku nije moguće promeniti. Pokušajte ponovo.
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sačuvaj novu lozinku"
            disabled={changePasswordMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className={`
              min-h-14
              items-center
              justify-center
              rounded-2xl
              bg-primary
              px-5
              ${
                changePasswordMutation.isPending
                  ? 'opacity-60'
                  : ''
              }
            `}
          >
            <Text
              className="
                text-base
                font-bold
                text-background
              "
            >
              {changePasswordMutation.isPending
                ? 'Čuvanje...'
                : 'Sačuvaj novu lozinku'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
