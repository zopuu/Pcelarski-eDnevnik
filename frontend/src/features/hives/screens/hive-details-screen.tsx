import { router } from 'expo-router';

import { useState } from 'react';

import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useHive } from '../hooks/use-hive';

import { useAppDrawer } from '@/providers/app-drawer-provider';

import { ActionOverflowSheet } from '@/shared/components/contextual-action-bar/action-overflow-sheet';

import { ContextualActionBar } from '@/shared/components/contextual-action-bar/contextual-action-bar';
import { ContextualAction } from '@/shared/components/contextual-action-bar/types';
import { AppHeader } from '@/shared/components/navigation/app-header';

import { Screen } from '@/shared/components/screen/screen';

import { colors } from '@/shared/theme/colors';
import { useCurrentColony } from '@/features/colonies/hooks/use-current-colony';

import { useCurrentQueen } from '@/features/queens/hooks/use-current-queen';
import { HiveHeaderIllustration } from '@/features/hives/components/hive-header-illustration';
import { QueenMarkingColorSwatch } from '@/features/queens/components/queen-marking-color-swatch';
import { useHiveSupers } from '@/features/hive-supers/hooks/use-hive-supers';

type HiveDetailsScreenProps = {
  hiveId: string;
};

const hiveTypeLabels: Record<string, string> = {
  dadantBlatt: 'DB',
  langstrothRoot: 'LR',
  albertiZnidersic: 'AŽ',
  farrar: 'Farar',
  nucleus: 'Nukleus',
  other: 'Ostalo',
};

const hiveMaterialLabels: Record<string, string> = {
  wood: 'Drvo',
  polystyrene: 'Polistiren',
  polyurethane: 'Poliuretan',
  plastic: 'Plastika',
  other: 'Ostalo',
};

function getHiveTypeLabel(value: string) {
  return hiveTypeLabels[value] ?? value;
}

function getHiveMaterialLabel(value: string | null) {
  if (!value) {
    return '—';
  }

  return hiveMaterialLabels[value] ?? value;
}

function getHiveStatusLabel(value: string) {
  switch (value.toLowerCase()) {
    case 'active':
      return 'Aktivna';

    case 'inactive':
      return 'Neaktivna';

    case 'writtenoff':
      return 'Rashodovana';

    case 'underrepair':
      return 'Na popravci';

    default:
      return value;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}.`;
}

function formatFeederVolume(value: number | null) {
  if (value === null) {
    return '—';
  }

  const liters = value / 1000;

  const formatted = liters
    .toFixed(2)
    .replace(/\.?0+$/, '')
    .replace('.', ',');

  return `${formatted} l`;
}

export function HiveDetailsScreen({ hiveId }: HiveDetailsScreenProps) {
  const { openDrawer } = useAppDrawer();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const [isHiveActionsOpen, setIsHiveActionsOpen] = useState(false);

  const { data: hive, isLoading, isError, refetch } = useHive(hiveId);
  const currentColonyQuery = useCurrentColony(hiveId);
  const hiveSupersQuery = useHiveSupers(hiveId);

  const currentColony = currentColonyQuery.data ?? null;

  const currentQueenQuery = useCurrentQueen(currentColony?.id ?? null);

  const currentQueen = currentQueenQuery.data ?? null;

  const header = <AppHeader onMenuPress={openDrawer} />;

  if (isLoading) {
    return (
      <Screen header={header}>
        <View
          className="
            flex-1
            items-center
            justify-center
          "
        >
          <ActivityIndicator size="large" color={colors.primary} />

          <Text
            className="
              mt-3
              text-muted
            "
          >
            Učitavanje košnice...
          </Text>
        </View>
      </Screen>
    );
  }

  if (isError || !hive) {
    return (
      <Screen header={header}>
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
            Nije moguće učitati podatke o košnici.
          </Text>

          <Pressable
            onPress={() => {
              void refetch();
            }}
            className="
              mt-5
              rounded-2xl
              bg-primary
              px-5
              py-3
            "
          >
            <Text
              className="
                font-bold
                text-background
              "
            >
              Pokušaj ponovo
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const isActive = String(hive.status).toLowerCase() === 'active';

  const handleStaysPress = () => {
    router.push(`/hives/${hiveId}/stays` as never);
  };

  const handleRelocationsPress = () => {
    router.push(`/hives/${hiveId}/relocations` as never);
  };

  const handleHiveActionsPress = () => {
    setIsHiveActionsOpen(true);
  };

  const handleHistoryPress = () => {
    router.push(`/hives/${hiveId}/history` as never);
  };

  const handleEditPress = () => {
    setIsMoreOpen(false);

    router.push(`/hives/${hiveId}/edit` as never);
  };

  const handleTransferColonyPress = () => {
    if (!currentColony) {
      return;
    }

    setIsMoreOpen(false);

    router.push({
      pathname: '/hives/[hiveId]/colonies/[colonyId]/transfer',

      params: {
        hiveId,

        colonyId: currentColony.id,
      },
    } as never);
  };

  const handleDeactivatePress = () => {
    setIsMoreOpen(false);

    Alert.alert(
      'Deaktiviraj košnicu',
      'Deaktiviranje košnice biće povezano kada implementiramo odgovarajući backend workflow.',
    );
  };

  const handleDeletePress = () => {
    Alert.alert('Obriši košnicu', 'Da li sigurno želite da obrišete ovu košnicu?', [
      {
        text: 'Otkaži',
        style: 'cancel',
      },

      {
        text: 'Obriši',
        style: 'destructive',

        onPress: () => {
          setIsMoreOpen(false);

          Alert.alert('Brisanje', 'Backend brisanje košnice još nije implementirano.');
        },
      },
    ]);
  };

  const moreActions: ContextualAction[] = [
    {
      key: 'edit',

      label: 'Izmeni',

      icon: 'create-outline',

      accessibilityLabel: 'Izmeni podatke o košnici',

      onPress: handleEditPress,
    },
  ];

  if (currentColony) {
    moreActions.push({
      key: 'transfer-colony',

      label: 'Premesti društvo',

      icon: 'swap-horizontal-outline',

      accessibilityLabel: 'Premesti društvo u drugu košnicu',

      onPress: handleTransferColonyPress,
    });
  }

  if (isActive) {
    moreActions.push({
      key: 'deactivate',

      label: 'Deaktiviraj',

      icon: 'power-outline',

      accessibilityLabel: 'Deaktiviraj košnicu',

      onPress: handleDeactivatePress,
    });
  }

  moreActions.push({
    key: 'delete',

    label: 'Obriši',

    icon: 'trash-outline',

    accessibilityLabel: 'Obriši košnicu',

    variant: 'danger',

    onPress: handleDeletePress,
  });
  return (
    <>
      <Screen
        header={header}
        contextualActionBar={
          <ContextualActionBar
            leftActions={[
              {
                key: 'stays',

                label: 'Boravci',

                icon: 'time-outline',

                accessibilityLabel: 'Prikaži istoriju boravaka košnice',

                onPress: handleStaysPress,
              },

              {
                key: 'relocations',

                label: 'Selidbe',

                icon: 'swap-horizontal-outline',

                accessibilityLabel: 'Prikaži selidbe košnice',

                onPress: handleRelocationsPress,
              },
            ]}
            primaryAction={{
              key: 'actions',

              label: 'Akcije',

              icon: 'construct-outline',

              accessibilityLabel: 'Otvori akcije nad košnicom',

              onPress: handleHiveActionsPress,
            }}
            rightActions={[
              {
                key: 'history',

                label: 'Istorija',

                icon: 'reader-outline',

                accessibilityLabel: 'Prikaži istoriju aktivnosti košnice',

                onPress: handleHistoryPress,
              },

              {
                key: 'more',

                label: 'Više',

                icon: 'ellipsis-horizontal',

                accessibilityLabel: 'Prikaži više opcija za košnicu',

                onPress: () => {
                  setIsMoreOpen(true);
                },
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
            className="
              mb-3
              mt-3
              self-start
              py-2
            "
          >
            <Text
              className="
                text-sm
                font-semibold
                text-primary
              "
            >
              ← Košnice
            </Text>
          </Pressable>

          <Text
            className="
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-muted
            "
          >
            Košnica
          </Text>

          <View
            className="
              mt-2
              flex-row
              items-start
              justify-between
              gap-4
            "
          >
            <View
              className="
                flex-1
              "
            >
              <Text
                className="
                  text-4xl
                  font-bold
                  tracking-tight
                  text-foreground
                "
              >
                {hive.label}
              </Text>

              <View
                className="
                  mt-3
                  flex-row
                  flex-wrap
                  gap-2
                "
              >
                <View
                  className="
                    rounded-full
                    bg-primary/10
                    px-3
                    py-1.5
                  "
                >
                  <Text
                    className="
                      text-xs
                      font-bold
                      text-primary
                    "
                  >
                    {getHiveTypeLabel(String(hive.type))}
                  </Text>
                </View>

                <View
                  className="
                    rounded-full
                    border
                    border-border
                    bg-surface
                    px-3
                    py-1.5
                  "
                >
                  <Text
                    className="
                      text-xs
                      font-semibold
                      text-muted
                    "
                  >
                    {getHiveStatusLabel(String(hive.status))}
                  </Text>
                </View>
              </View>
            </View>

            <HiveHeaderIllustration colorHex={hive.colorHex} />
          </View>

          <SectionTitle>Osnovni podaci</SectionTitle>

          <DetailsCard>
            <InfoRow label="Identifikacioni broj" value={hive.identificationNumber ?? '—'} />

            <InfoRow label="Tip" value={getHiveTypeLabel(String(hive.type))} />

            <InfoRow label="Proizvođač" value={hive.manufacturer ?? '—'} />

            <InfoRow
              label="Materijal"
              value={getHiveMaterialLabel(hive.material ? String(hive.material) : null)}
            />

            <InfoRow label="Datum proizvodnje" value={formatDate(hive.manufactureDate)} />

            <InfoRow label="Datum nabavke" value={formatDate(hive.purchaseDate)} />

            <InfoRow
              label="Trenutni broj nastavaka"
              value={
                hiveSupersQuery.isError
                  ? '—'
                  : hiveSupersQuery.isLoading
                    ? '…'
                    : String(hiveSupersQuery.data?.length ?? 0)
              }
              last
            />
          </DetailsCard>

          <SectionTitle>Hranilica</SectionTitle>

          <View
            className="
              flex-row
              gap-3
            "
          >
            <MetricCard label="Hranilica" value={hive.hasFeeder ? 'Ima' : 'Nema'} />

            <MetricCard
              label="Kapacitet"
              value={hive.hasFeeder ? formatFeederVolume(hive.feederVolumeMl) : '—'}
            />
          </View>

          <SectionTitle>Društvo i matica</SectionTitle>

          {currentColonyQuery.isLoading ? (
            <DetailsCard>
              <View
                className="
        items-center
        py-4
      "
              >
                <ActivityIndicator color={colors.primary} />

                <Text
                  className="
          mt-2
          text-sm
          text-muted
        "
                >
                  Učitavanje društva...
                </Text>
              </View>
            </DetailsCard>
          ) : !currentColony ? (
            <DetailsCard>
              <Text
                className="
        text-base
        font-bold
        text-foreground
      "
              >
                Košnica nema evidentirano društvo i maticu
              </Text>

              <Text
                className="
        mt-2
        text-sm
        leading-5
        text-muted
      "
              >
                Dodajte trenutno pčelinje društvo i njegovu maticu.
              </Text>

              <Pressable
                onPress={() => {
                  router.push({
                    pathname: '/hives/[hiveId]/colony-queen/create',

                    params: {
                      hiveId,
                    },
                  });
                }}
                className="
        mt-5
        min-h-12
        items-center
        justify-center
        rounded-2xl
        bg-primary
        px-4
      "
              >
                <Text
                  className="
          font-bold
          text-background
        "
                >
                  Dodaj društvo i maticu
                </Text>
              </Pressable>
            </DetailsCard>
          ) : (
            <View
              className="
      gap-3
    "
            >
              <EntitySummaryCard
                title="Pčelinje društvo"
                onPress={() => {
                  router.push({
                    pathname: '/hives/[hiveId]/colonies/[colonyId]',

                    params: {
                      hiveId,

                      colonyId: currentColony.id,
                    },
                  } as never);
                }}
              >
                <InfoRow label="Status" value={getColonyStatusLabel(currentColony.status)} />

                <InfoRow label="Poreklo" value={getColonyOriginLabel(currentColony.origin)} />

                <InfoRow label="Formirano" value={formatDate(currentColony.formedOn)} />

                <InfoRow label="U košnici od" value={formatDate(currentColony.startedOn)} last />
              </EntitySummaryCard>

              {currentQueenQuery.isLoading ? (
                <DetailsCard>
                  <ActivityIndicator color={colors.primary} />
                </DetailsCard>
              ) : currentQueen ? (
                <EntitySummaryCard
                  title="Matica"
                  onPress={() => {
                    router.push({
                      pathname: '/hives/[hiveId]/colonies/[colonyId]/queens/[queenId]',

                      params: {
                        hiveId,

                        colonyId: currentColony.id,

                        queenId: currentQueen.id,
                      },
                    } as never);
                  }}
                >
                  <InfoRow label="Status" value={getQueenStatusLabel(currentQueen.status)} />

                  <InfoRow label="Poreklo" value={getQueenOriginLabel(currentQueen.origin)} />

                  <InfoRow
                    label="Boja"
                    value={<QueenMarkingColorSwatch colorHex={currentQueen.markingColorHex} />}
                  />

                  <InfoRow label="Rasa" value={currentQueen.breed ?? '—'} />

                  <InfoRow label="Izlegla se" value={formatDate(currentQueen.emergedOn)} />

                  <InfoRow label="U društvu od" value={formatDate(currentQueen.startedOn)} last />
                </EntitySummaryCard>
              ) : (
                <DetailsCard>
                  <Text
                    className="
            font-semibold
            text-warning
          "
                  >
                    Društvo postoji, ali trenutna matica nije evidentirana.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dodaj maticu"
                    className="mt-4 min-h-12 items-center justify-center rounded-2xl bg-primary px-4"
                    onPress={() =>
                      router.push({
                        pathname: '/hives/[hiveId]/colonies/[colonyId]/queens/create',
                        params: {
                          hiveId,
                          colonyId: currentColony.id,
                        },
                      } as never)
                    }
                  >
                    <Text className="font-bold text-background">Dodaj maticu</Text>
                  </Pressable>
                </DetailsCard>
              )}
            </View>
          )}

          {hive.note && (
            <>
              <SectionTitle>Napomena</SectionTitle>

              <DetailsCard>
                <Text
                  className="
                    text-base
                    leading-6
                    text-foreground
                  "
                >
                  {hive.note}
                </Text>
              </DetailsCard>
            </>
          )}
        </ScrollView>
      </Screen>

      <ActionOverflowSheet
        visible={isHiveActionsOpen}
        onClose={() => {
          setIsHiveActionsOpen(false);
        }}
        title="Akcije nad košnicom"
        actions={[
          {
            key: 'maintenance',

            label: 'Održavanje',

            icon: 'build-outline',

            accessibilityLabel: 'Evidentiraj održavanje košnice',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/maintenance/create',

                params: {
                  hiveId,
                },
              } as never);
            },
          },

          {
            key: 'super-management',

            label: 'Upravljanje nastavcima',

            icon: 'layers-outline',

            accessibilityLabel: 'Upravljaj nastavcima košnice',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/supers',

                params: {
                  hiveId,
                },
              } as never);
            },
          },

          {
            key: 'insulation',

            label: 'Izolacija košnice',

            icon: 'layers-outline',

            accessibilityLabel: 'Evidentiraj izolaciju za košnicu',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/insulation/create',

                params: {
                  hiveId,
                },
              } as never);
            },
          },

          {
            key: 'honey-frame-feeding',

            label: 'Prihrana ramovima meda',

            icon: 'albums-outline',

            accessibilityLabel: 'Evidentiraj prihranu ramovima meda za košnicu',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/honey-frame-feedings/create',

                params: {
                  hiveId,
                },
              } as never);
            },
          },

          {
            key: 'patty-feeding',

            label: 'Prihrana pogačom',

            icon: 'nutrition-outline',

            accessibilityLabel: 'Evidentiraj prihranu pogačom za košnicu',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/patty-feedings/create',

                params: {
                  hiveId,
                },
              } as never);
            },
          },

          {
            key: 'syrup-feeding',

            label: 'Prihrana sirupom',

            icon: 'water-outline',

            accessibilityLabel: 'Evidentiraj prihranu sirupom za košnicu',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/syrup-feedings/create',

                params: {
                  hiveId,
                },
              } as never);
            },
          },

          {
            key: 'inspection',

            label: 'Pregled košnice',

            icon: 'search-outline',

            accessibilityLabel: 'Evidentiraj pregled košnice',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/inspections/create',

                params: {
                  hiveId,
                },
              } as never);
            },
          },

          {
            key: 'varroa-treatment',

            label: 'Tretman protiv varoe',

            icon: 'bug-outline',

            accessibilityLabel: 'Evidentiraj tretman protiv varoe za košnicu',

            onPress: () => {
              router.push({
                pathname: '/hives/[hiveId]/varroa-treatments/create',

                params: {
                  hiveId,
                },
              } as never);
            },
          },
        ]}
      />

      <ActionOverflowSheet
        visible={isMoreOpen}
        onClose={() => {
          setIsMoreOpen(false);
        }}
        title={`Košnica ${hive.label}`}
        actions={moreActions}
      />
    </>
  );
}

type SectionTitleProps = {
  children: React.ReactNode;
};

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <Text
      className="
        mb-3
        mt-8
        text-lg
        font-bold
        text-foreground
      "
    >
      {children}
    </Text>
  );
}

type DetailsCardProps = {
  children: React.ReactNode;
};

function DetailsCard({ children }: DetailsCardProps) {
  return (
    <View
      className="
        rounded-3xl
        border
        border-border
        bg-surface
        px-5
        py-4
      "
    >
      {children}
    </View>
  );
}

type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  last?: boolean;
};

function InfoRow({ label, value, last = false }: InfoRowProps) {
  return (
    <View
      className={`
        flex-row
        items-start
        justify-between
        gap-6
        py-3
        ${last ? '' : 'border-b border-border'}
      `}
    >
      <Text
        className="
          flex-1
          text-sm
          text-muted
        "
      >
        {label}
      </Text>

      {typeof value === 'string' ? (
        <Text
          className="
          flex-1
          text-right
          text-sm
          font-semibold
          text-foreground
        "
        >
          {value}
        </Text>
      ) : (
        <View
          className="
          flex-1
          items-end
        "
        >
          {value}
        </View>
      )}
    </View>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <View
      className="
        flex-1
        rounded-3xl
        border
        border-border
        bg-surface
        px-5
        py-5
      "
    >
      <Text
        className="
          text-xs
          font-semibold
          text-muted
        "
      >
        {label}
      </Text>

      <Text
        className="
          mt-2
          text-xl
          font-bold
          text-foreground
        "
      >
        {value}
      </Text>
    </View>
  );
}

function getColonyStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Aktivno';

    case 'dead':
      return 'Uginulo';

    case 'split':
      return 'Podeljeno';

    case 'merged':
      return 'Spojeno';

    case 'sold':
      return 'Prodato';

    case 'lost':
      return 'Izgubljeno';

    default:
      return status;
  }
}

function getColonyOriginLabel(origin: string | null) {
  switch (origin) {
    case 'swarm':
      return 'Roj';

    case 'purchased':
      return 'Kupljeno';

    case 'split':
      return 'Podelom';

    default:
      return '—';
  }
}

function getQueenStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Aktivna';

    case 'dead':
      return 'Uginula';

    case 'killed':
      return 'Ubijena';

    case 'missing':
      return 'Nestala';

    default:
      return status;
  }
}

function getQueenOriginLabel(origin: string | null) {
  switch (origin) {
    case 'purchased':
      return 'Kupljena';

    case 'produced':
      return 'Odgojena';

    default:
      return '—';
  }
}
type EntitySummaryCardProps = {
  title: string;
  children: React.ReactNode;
  onPress: () => void;
};

function EntitySummaryCard({ title, children, onPress }: EntitySummaryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="
        rounded-3xl
        border
        border-border
        bg-surface
        px-5
        py-4
      "
    >
      <View
        className="
          mb-2
          flex-row
          items-center
          justify-between
        "
      >
        <Text
          className="
            text-base
            font-bold
            text-foreground
          "
        >
          {title}
        </Text>

        <Text
          className="
            text-xl
            font-semibold
            text-primary
          "
        >
          ›
        </Text>
      </View>

      {children}
    </Pressable>
  );
}
