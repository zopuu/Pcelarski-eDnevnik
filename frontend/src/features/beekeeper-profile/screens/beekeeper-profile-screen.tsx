import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useMyProfile } from '@/features/beekeeper-profile/hooks/use-my-profile';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ContextualActionBar } from '@/shared/components/contextual-action-bar/contextual-action-bar';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

type ProfileField = {
  label: string;
  value: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === '' ? 'Nije uneto' : value.toString();
}

export function BeekeeperProfileScreen() {
  const { openDrawer } = useAppDrawer();
  const profileQuery = useMyProfile();
  const currentUserQuery = useCurrentUser();

  const header = <AppHeader onMenuPress={openDrawer} />;

  const isLoading = profileQuery.isLoading || currentUserQuery.isLoading;

  if (isLoading) {
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
        <LoadError
          onRetry={() => {
            void Promise.all([profileQuery.refetch(), currentUserQuery.refetch()]);
          }}
        />
      </Screen>
    );
  }

  const profile = profileQuery.data;
  const user = currentUserQuery.data;
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toLocaleUpperCase(
    'sr-Latn-RS',
  );

  const identityFields: ProfileField[] = [
    {
      label: 'HID',
      value: displayValue(profile.hid),
      icon: 'barcode-outline',
    },
    {
      label: 'Broj poljoprivrednog gazdinstva',
      value: displayValue(profile.agriculturalHoldingNumber),
      icon: 'business-outline',
    },
  ];

  const contactFields: ProfileField[] = [
    {
      label: 'Email',
      value: displayValue(user.email),
      icon: 'mail-outline',
    },
    {
      label: 'Telefon',
      value: displayValue(profile.phone),
      icon: 'call-outline',
    },
  ];

  return (
    <Screen
      header={header}
      contextualActionBar={
        <ContextualActionBar
          leftActions={[
            {
              key: 'change-password',
              label: 'Lozinka',
              icon: 'lock-closed-outline',
              accessibilityLabel: 'Promeni lozinku',
              onPress: () => {
                router.push('/profile/change-password' as never);
              },
            },
          ]}
          primaryAction={{
            key: 'edit-profile',
            label: 'Izmeni',
            icon: 'create-outline',
            accessibilityLabel: 'Izmeni podatke profila',
            onPress: () => {
              router.push('/profile/edit' as never);
            },
          }}
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na početnu"
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
            ← Početna
          </Text>
        </Pressable>

        <View
          className="
            items-center
            rounded-3xl
            border
            border-border
            bg-surface
            px-6
            py-7
          "
        >
          <View
            accessibilityLabel="Ikonica profila"
            className="
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-primary/15
            "
          >
            <Text
              className="
                text-3xl
                font-bold
                text-primary-dark
              "
            >
              {initials}
            </Text>
          </View>

          <Text
            className="
              mt-4
              text-2xl
              font-bold
              text-foreground
            "
          >
            {fullName}
          </Text>

          <Text
            className="
              mt-1
              text-sm
              text-muted
            "
          >
            Profil pčelara
          </Text>
        </View>

        <ProfileSection title="Identifikacioni podaci" fields={identityFields} />

        <ProfileSection title="Kontakt podaci" fields={contactFields} />
      </ScrollView>
    </Screen>
  );
}

function ProfileSection({ title, fields }: { title: string; fields: ProfileField[] }) {
  return (
    <View className="mt-7">
      <Text
        className="
          mb-3
          text-lg
          font-bold
          text-foreground
        "
      >
        {title}
      </Text>

      <View
        className="
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-surface
        "
      >
        {fields.map((field, index) => (
          <View
            key={field.label}
            className={`
              flex-row
              items-start
              px-4
              py-4
              ${index < fields.length - 1 ? 'border-b border-border' : ''}
            `}
          >
            <Ionicons name={field.icon} size={22} color={colors.primaryDark} />

            <View className="ml-3 flex-1">
              <Text
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted
                "
              >
                {field.label}
              </Text>

              <Text
                selectable
                className="
                  mt-1
                  text-base
                  text-foreground
                "
              >
                {field.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
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

function LoadError({ onRetry }: { onRetry: () => void }) {
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
        Nije moguće učitati profil.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pokušaj ponovo da učitaš profil"
        onPress={onRetry}
        className="
          mt-5
          rounded-2xl
          bg-primary
          px-5
          py-3
        "
      >
        <Text className="font-bold text-background">Pokušaj ponovo</Text>
      </Pressable>
    </View>
  );
}
