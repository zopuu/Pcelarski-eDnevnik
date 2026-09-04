import type { ComponentProps } from "react";

import Ionicons from "@react-native-vector-icons/ionicons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useCurrentForageProfile } from "../hooks/use-current-forage-profile";
import { useDeleteForageProfile } from "../hooks/use-delete-forage-profile";
import type { ForageType } from "../types/forage-profile";

import { ApiError } from "@/shared/api/api-error";
import { AppHeader } from "@/shared/components/navigation/app-header";
import { Screen } from "@/shared/components/screen/screen";
import { ContextualActionBar } from "@/shared/components/contextual-action-bar/contextual-action-bar";
import { colors } from "@/shared/theme/colors";
import { useAppDrawer } from "@/providers/app-drawer-provider";

type ForageProfileDetailsScreenProps = {
  apiaryId: string;
};

type ForageIconName = ComponentProps<typeof MaterialDesignIcons>["name"];

const forageTypeLabels: Record<ForageType, string> = {
  meadow: "Livada",
  forest: "Šuma",
  sunflower: "Suncokret",
  acacia: "Bagrem",
  linden: "Lipa",
  oilseedRape: "Uljana repica",
  clover: "Detelina",
  fruitTrees: "Voćke",
  chestnut: "Kesten",
  buckwheat: "Heljda",
  other: "Ostalo",
};

const forageTypeIcons: Record<ForageType, ForageIconName> = {
  meadow: "flower-outline",
  forest: "tree",
  sunflower: "flower-tulip",
  acacia: "tree-outline",
  linden: "tree-outline",
  oilseedRape: "flower",
  clover: "clover",
  fruitTrees: "fruit-cherries",
  chestnut: "nut",
  buckwheat: "barley",
  other: "dots-horizontal-circle-outline",
};

function getIntensityLabel(intensity: number) {
  switch (intensity) {
    case 1:
      return "Vrlo slaba";
    case 2:
      return "Slaba";
    case 3:
      return "Srednja";
    case 4:
      return "Jaka";
    case 5:
      return "Vrlo jaka";
    default:
      return String(intensity);
  }
}

export function ForageProfileDetailsScreen({
  apiaryId,
}: ForageProfileDetailsScreenProps) {
  const { openDrawer } = useAppDrawer();

  const [selectedYear, setSelectedYear] = useState<number>();

  const profileQuery = useCurrentForageProfile(apiaryId, selectedYear);

  const deleteMutation = useDeleteForageProfile(apiaryId);

  const profile = profileQuery.data;
  const isNoProfile =
    profileQuery.error instanceof ApiError && profileQuery.error.status === 404;

  const header = <AppHeader onMenuPress={openDrawer} />;

  if (profileQuery.isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Učitavanje profila paše..." />
      </Screen>
    );
  }

  if (isNoProfile) {
    return (
      <Screen header={header}>
        <EmptyProfileState apiaryId={apiaryId} />
      </Screen>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <Screen header={header}>
        <LoadError
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const sortedItems = [...profile.items].sort(
    (first, second) => second.percentage - first.percentage,
  );

  const handleEditPress = () => {
    router.push({
      pathname: "/apiaries/[apiaryId]/forage-profiles/[forageProfileId]/edit",
      params: {
        apiaryId,
        forageProfileId: profile.id,
        year: String(profile.year),
      },
    } as never);
  };

  const handleLockStatusPress = () => {
    Alert.alert(
      "Status paše",
      profile.isLocked
        ? "Paša je zaključana, sezona je završena."
        : "Možete menjati pašu do kraja tekuće sezone.",
    );
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Obriši profil paše",
      "Da li sigurno želite da obrišete ovaj profil paše i sve njegove stavke?",
      [
        {
          text: "Otkaži",
          style: "cancel",
        },
        {
          text: "Obriši",
          style: "destructive",
          onPress: () => {
            void deleteMutation
              .mutateAsync(profile.id)
              .then(() => {
                router.replace({
                  pathname: "/apiaries/[apiaryId]/forage-profiles",
                  params: {
                    apiaryId,
                  },
                } as never);
              })
              .catch(() => {
                Alert.alert(
                  "Brisanje nije uspelo",
                  "Profil paše nije moguće obrisati. Pokušajte ponovo.",
                );
              });
          },
        },
      ],
    );
  };

  return (
    <Screen
      header={header}
      contextualActionBar={
        <ContextualActionBar
          leftActions={[
            {
              key: "forage-profile-observations",
              label: "Zapazanja",
              icon: "camera-outline",
              accessibilityLabel: "Prikazi zapazanja vezana za profil paše",
              onPress: () => {
                
              }
            },
            {
              key: "lock-status",
              label: profile.isLocked ? "Zaključana" : "Otključana",
              icon: profile.isLocked
                ? "lock-closed-outline"
                : "lock-open-outline",
              accessibilityLabel: "Prikaži status zaključavanja paše",
              onPress: handleLockStatusPress,
            },
          ]}
          primaryAction={{
            key: "edit",
            label: "Izmeni",
            icon: "create-outline",
            accessibilityLabel: "Izmeni profil paše",
            onPress: handleEditPress,
            disabled: profile.isLocked,
          }}
          rightActions={[
            {
              key: "delete",
              label: "Obriši",
              icon: "trash-outline",
              accessibilityLabel: "Obriši profil paše",
              variant: "danger",
              onPress: handleDeletePress,
              disabled: profile.isLocked,
              loading: deleteMutation.isPending,
            },
            {
              key: "more",
              label: "Više",
              icon: "ellipsis-horizontal-outline",
              accessibilityLabel: "Prikaži više opcija",
              onPress: () => {
              }
            },
          ]}
      
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
      >
        <Pressable
          onPress={() => {
            router.back();
          }}
          className="mb-3 mt-3 self-start py-2"
        >
          <Text className="text-sm font-semibold text-primary">
            ← Pčelinjak
          </Text>
        </Pressable>

        <Text className="text-xs font-bold uppercase tracking-widest text-muted">
          Profil paše
        </Text>

        <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {profile.name}
        </Text>

        <View className="mt-5">
          <Text className="mb-2 text-sm font-semibold text-foreground">
            Godina
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {profile.availableYears.map((year) => {
              const isSelected = profile.year === year;

              return (
                <Pressable
                  key={year}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    if (!isSelected) {
                      setSelectedYear(year);
                    }
                  }}
                  className={`
                    min-h-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-4
                    ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border bg-surface"
                    }
                  `}
                >
                  <Text
                    className={`font-semibold ${isSelected ? "text-background" : "text-foreground"}`}
                  >
                    {year}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <SectionTitle>Obuhvat</SectionTitle>
        <DetailsCard>
          <InfoRow label="Godina" value={String(profile.year)} />
          <InfoRow
            label="Poluprečnik"
            value={
              profile.radiusKm === null ? "Nije unet" : `${profile.radiusKm} km`
            }
            last
          />
        </DetailsCard>

        {profile.notes && (
          <>
            <SectionTitle>Napomena</SectionTitle>
            <DetailsCard>
              <Text className="text-base leading-6 text-foreground">
                {profile.notes}
              </Text>
            </DetailsCard>
          </>
        )}

        <View className="mb-3 mt-8 flex-row items-end justify-between gap-4">
          <View>
            <Text className="text-lg font-bold text-foreground">
              Zastupljenost paše
            </Text>
            <Text className="mt-1 text-sm text-muted">
              {profile.items.length === 1
                ? "1 vrsta paše"
                : `${profile.items.length} vrsta paše`}
            </Text>
          </View>

          {profileQuery.isFetching && (
            <ActivityIndicator color={colors.primary} />
          )}
        </View>

        <View className="overflow-hidden rounded-3xl border border-border bg-surface">
          {sortedItems.map((item, index) => (
            <View
              key={item.id}
              className={`
                flex-row
                items-center
                gap-3
                px-4
                py-4
                ${index < sortedItems.length - 1 ? "border-b border-border" : ""}
              `}
            >
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <MaterialDesignIcons
                  name={forageTypeIcons[item.forageType]}
                  size={22}
                  color={colors.primary}
                />
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-foreground">
                  {forageTypeLabels[item.forageType]}
                </Text>

                <Text className="mt-0.5 text-sm text-muted">
                  Jačina: {getIntensityLabel(item.intensity)}
                </Text>

                {item.notes && (
                  <Text className="mt-1 text-sm text-muted">{item.notes}</Text>
                )}
              </View>

              <Text className="text-lg font-bold text-primary">
                {item.percentage.toFixed(2)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function EmptyProfileState({ apiaryId }: { apiaryId: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
        <Ionicons name="leaf-outline" size={32} color={colors.primary} />
      </View>

      <Text className="mt-5 text-center text-xl font-bold text-foreground">
        Nema profila paše
      </Text>

      <Text className="mt-2 text-center text-base leading-6 text-muted">
        Za trenutni boravak pčelinjaka još nije napravljen profil paše.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kreiraj profil paše"
        onPress={() => {
          router.push({
            pathname: "/apiaries/[apiaryId]/forage-profiles/create",
            params: {
              apiaryId,
            },
          } as never);
        }}
        className="mt-6 min-h-14 items-center justify-center rounded-2xl bg-primary px-5"
      >
        <Text className="text-base font-bold text-background">
          Kreiraj profil paše
        </Text>
      </Pressable>
    </View>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">{label}</Text>
    </View>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati profil paše.
      </Text>

      <Pressable
        onPress={onRetry}
        className="mt-5 rounded-2xl bg-primary px-5 py-3"
      >
        <Text className="font-bold text-background">Pokušaj ponovo</Text>
      </Pressable>
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

function DetailsCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-3xl border border-border bg-surface px-5 py-1">
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={last ? "py-4" : "border-b border-border py-4"}>
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </Text>
      <Text className="mt-1 text-base text-foreground">{value}</Text>
    </View>
  );
}
