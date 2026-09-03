import {
  router,
} from 'expo-router';

import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useCurrentColony,
} from '../hooks/use-current-colony';

import {
  useCurrentQueen,
} from '@/features/queens/hooks/use-current-queen';
import {
  QueenMarkingColorSwatch,
} from '@/features/queens/components/queen-marking-color-swatch';
import {
  ActionOverflowSheet,
} from '@/shared/components/contextual-action-bar/action-overflow-sheet';
import {
  ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';
import type {
  ContextualAction,
} from '@/shared/components/contextual-action-bar/types';
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
  useAppDrawer,
} from '@/providers/app-drawer-provider';

type ColonyDetailsScreenProps = {
  hiveId: string;
  colonyId: string;
};

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

function getIntroductionMethodLabel(method: string | null) {
  switch (method) {
    case 'placement':
      return 'Dodavanjem';
    case 'caged':
      return 'U kavezu';
    case 'direct':
      return 'Direktno';
    case 'unknown':
      return 'Nepoznato';
    case 'other':
      return 'Drugo';
    default:
      return '—';
  }
}

function getIntroductionOutcomeLabel(outcome: string | null) {
  switch (outcome) {
    case 'accepted':
      return 'Prihvaćena';
    case 'killed':
      return 'Ubijena';
    case 'missing':
      return 'Nestala';
    case 'unverified':
      return 'Nije provereno';
    case 'other':
      return 'Drugo';
    default:
      return '—';
  }
}

export function ColonyDetailsScreen({
  hiveId,
  colonyId,
}: ColonyDetailsScreenProps) {
  const {
    openDrawer,
  } = useAppDrawer();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const colonyQuery = useCurrentColony(hiveId);
  const colony = colonyQuery.data?.id === colonyId
    ? colonyQuery.data
    : null;
  const queenQuery = useCurrentQueen(colony?.id ?? null);
  const queen = queenQuery.data ?? null;

  const header = (
    <AppHeader onMenuPress={openDrawer} />
  );

  if (colonyQuery.isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Učitavanje društva..." />
      </Screen>
    );
  }

  if (colonyQuery.isError || !colony) {
    return (
      <Screen header={header}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base font-semibold text-error">
            Nije moguće učitati podatke o društvu.
          </Text>

          <Pressable
            onPress={() => {
              void colonyQuery.refetch();
            }}
            className="mt-5 rounded-2xl bg-primary px-5 py-3"
          >
            <Text className="font-bold text-background">
              Pokušaj ponovo
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const showPlaceholder = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const handleEndStayPress = () => {
    Alert.alert(
      'Završi boravak društva',
      'Ovde će se kasnije evidentirati datum i razlog završetka boravka društva u košnici.',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Završi boravak',
          style: 'destructive',
          onPress: () => {
            showPlaceholder(
              'Završavanje boravka',
              'Završavanje boravka društva još nije implementirano.',
            );
          },
        },
      ],
    );
  };

  const moreActions: ContextualAction[] = [
    {
      key: 'end-stay',
      label: 'Završi boravak',
      icon: 'log-out-outline',
      accessibilityLabel: 'Završi boravak društva u košnici',
      variant: 'danger',
      onPress: handleEndStayPress,
    },
  ];

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
                accessibilityLabel: 'Prikaži istoriju boravaka društva',
                onPress: () => {
                  showPlaceholder(
                    'Istorija boravaka',
                    'Istorija boravaka društva biće dostupna kada je implementiramo.',
                  );
                },
              },
              {
                key: 'queens',
                label: 'Matice',
                icon: 'heart-outline',
                accessibilityLabel: 'Prikaži istoriju matica društva',
                onPress: () => {
                  showPlaceholder(
                    'Istorija matica',
                    'Istorija matica društva biće dostupna kada je implementiramo.',
                  );
                },
              },
            ]}
            primaryAction={{
              key: 'actions',
              label: 'Akcije',
              icon: 'construct-outline',
              accessibilityLabel: 'Otvori akcije nad društvom',
              onPress: () => {
                showPlaceholder(
                  'Akcije nad društvom',
                  'Ovde će kasnije biti pregled, prihrana, tretman i ostale akcije nad društvom.',
                );
              },
            }}
            rightActions={[
              {
                key: 'edit',
                label: 'Izmeni',
                icon: 'create-outline',
                accessibilityLabel: 'Izmeni podatke o društvu',
                onPress: () => {
                  showPlaceholder(
                    'Izmena društva',
                    'Ekran za izmenu društva još nije implementiran.',
                  );
                },
              },
              {
                key: 'more',
                label: 'Više',
                icon: 'ellipsis-horizontal',
                accessibilityLabel: 'Prikaži više opcija za društvo',
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
            className="mb-3 mt-3 self-start py-2"
          >
            <Text className="text-sm font-semibold text-primary">
              ← Košnica
            </Text>
          </Pressable>

          <Text className="text-xs font-bold uppercase tracking-widest text-muted">
            Pčelinje društvo
          </Text>

          <View className="mt-2 flex-row items-start justify-between gap-4">
            <Text className="flex-1 text-3xl font-bold tracking-tight text-foreground">
              Pčelinje društvo
            </Text>

            <View className="rounded-full bg-primary/10 px-3 py-1.5">
              <Text className="text-xs font-bold text-primary">
                {getColonyStatusLabel(colony.status)}
              </Text>
            </View>
          </View>

          <SectionTitle>Osnovni podaci</SectionTitle>
          <DetailsCard>
            <InfoRow label="Poreklo" value={getColonyOriginLabel(colony.origin)} />
            <InfoRow label="Formirano" value={formatDate(colony.formedOn)} />
            <InfoRow label="Status" value={getColonyStatusLabel(colony.status)} last />
          </DetailsCard>

          <SectionTitle>Trenutni boravak</SectionTitle>
          <DetailsCard>
            <InfoRow label="U košnici od" value={formatDate(colony.startedOn)} />
            <InfoRow label="Napomena o boravku" value={colony.stayNotes ?? '—'} last />
          </DetailsCard>

          {colony.notes && (
            <>
              <SectionTitle>Napomena o društvu</SectionTitle>
              <DetailsCard>
                <Text className="text-base leading-6 text-foreground">
                  {colony.notes}
                </Text>
              </DetailsCard>
            </>
          )}

          <SectionTitle>Trenutna matica</SectionTitle>
          {queenQuery.isLoading ? (
            <DetailsCard>
              <View className="items-center py-4">
                <ActivityIndicator color={colors.primary} />
                <Text className="mt-2 text-sm text-muted">
                  Učitavanje matice...
                </Text>
              </View>
            </DetailsCard>
          ) : queen ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Otvori detalje matice"
              onPress={() => {
                showPlaceholder(
                  'Detalji matice',
                  'Stranica sa detaljima matice biće povezana kada je implementiramo.',
                );
              }}
              className="rounded-3xl border border-border bg-surface px-5 py-4"
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-base font-bold text-foreground">Matica</Text>
                <Text className="text-xl font-semibold text-primary">›</Text>
              </View>

              <InfoRow label="Status" value={getQueenStatusLabel(queen.status)} />
              <InfoRow label="Poreklo" value={getQueenOriginLabel(queen.origin)} />
              <InfoRow label="Rasa" value={queen.breed ?? '—'} />
              <InfoRow label="Odgajivač" value={queen.breeder ?? '—'} />
              <InfoRow
                label="Boja"
                value={
                  <QueenMarkingColorSwatch
                    colorHex={queen.markingColorHex}
                  />
                }
              />
              <InfoRow label="Izlegla se" value={formatDate(queen.emergedOn)} />
              <InfoRow label="Nabavljena" value={formatDate(queen.acquiredOn)} />
              <InfoRow label="U društvu od" value={formatDate(queen.startedOn)} />
              <InfoRow label="Način dodavanja" value={getIntroductionMethodLabel(queen.introductionMethod)} />
              <InfoRow label="Ishod dodavanja" value={getIntroductionOutcomeLabel(queen.introductionOutcome)} />
              <InfoRow label="Napomena o boravku" value={queen.stayNotes ?? '—'} />
              <InfoRow label="Napomena o matici" value={queen.notes ?? '—'} last />
            </Pressable>
          ) : (
            <DetailsCard>
              <Text className="font-semibold text-warning">
                Društvo nema evidentiranu trenutnu maticu.
              </Text>
            </DetailsCard>
          )}
        </ScrollView>
      </Screen>

      <ActionOverflowSheet
        visible={isMoreOpen}
        onClose={() => {
          setIsMoreOpen(false);
        }}
        title="Pčelinje društvo"
        actions={moreActions}
      />
    </>
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
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View
      className={last
        ? 'py-4'
        : 'border-b border-border py-4'}
    >
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text className="mt-1 text-base text-foreground">
          {value}
        </Text>
      ) : (
        <View className="mt-2">
          {value}
        </View>
      )}
    </View>
  );
}
