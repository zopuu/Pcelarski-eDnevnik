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
} from '@/features/colonies/hooks/use-current-colony';
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

import {
  QueenHeaderIllustration,
} from '../components/queen-header-illustration';
import {
  QueenMarkingColorSwatch,
} from '../components/queen-marking-color-swatch';
import {
  useCurrentQueen,
} from '../hooks/use-current-queen';

type QueenDetailsScreenProps = {
  hiveId: string;
  colonyId: string;
  queenId: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  const [year, month, day] = value.split('-');

  return year && month && day
    ? `${day}.${month}.${year}.`
    : value;
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
    case 'sold':
      return 'Prodata';
    case 'removed':
      return 'Uklonjena';
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

export function QueenDetailsScreen({
  hiveId,
  colonyId,
  queenId,
}: QueenDetailsScreenProps) {
  const {
    openDrawer,
  } = useAppDrawer();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const colonyQuery = useCurrentColony(hiveId);
  const colony = colonyQuery.data?.id === colonyId
    ? colonyQuery.data
    : null;
  const queenQuery = useCurrentQueen(colony?.id ?? null);
  const queen = queenQuery.data?.id === queenId
    ? queenQuery.data
    : null;

  const header = <AppHeader onMenuPress={openDrawer} />;

  if (colonyQuery.isLoading || queenQuery.isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Učitavanje matice..." />
      </Screen>
    );
  }

  if (colonyQuery.isError || queenQuery.isError || !colony || !queen) {
    return (
      <Screen header={header}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base font-semibold text-error">
            Nije moguće učitati podatke o matici.
          </Text>

          <Pressable
            onPress={() => {
              void colonyQuery.refetch();
              void queenQuery.refetch();
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
      'Završi boravak matice',
      'Ovde će se kasnije evidentirati datum i razlog završetka boravka matice u društvu.',
      [
        {
          text: 'Otkaži',
          style: 'cancel',
        },
        {
          text: 'Završi boravak',
          style: 'destructive',
          onPress: () => {
            showPlaceholder(
              'Završavanje boravka',
              'Završavanje boravka matice još nije implementirano.',
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
      accessibilityLabel: 'Završi boravak matice u društvu',
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
                accessibilityLabel: 'Prikaži istoriju boravaka matice',
                onPress: () => {
                  router.push({
                    pathname:
                      '/hives/[hiveId]/colonies/[colonyId]/queens/[queenId]/stays',
                    params: {
                      hiveId,
                      colonyId,
                      queenId,
                    },
                  } as never);
                },
              },
              {
                key: 'current-stay',
                label: 'Boravak',
                icon: 'home-outline',
                accessibilityLabel: 'Prikaži trenutni boravak matice',
                onPress: () => {
                  showPlaceholder(
                    'Trenutni boravak',
                    'Detalji trenutnog boravka matice nalaze se na ovom ekranu.',
                  );
                },
              },
            ]}
            primaryAction={{
              key: 'replace',
              label: 'Zameni',
              icon: 'swap-horizontal-outline',
              accessibilityLabel: 'Zameni trenutnu maticu',
              onPress: () => {
                router.push({
                  pathname: '/hives/[hiveId]/colonies/[colonyId]/queens/[queenId]/change',
                  params: { hiveId, colonyId, queenId },
                } as never);
              },
            }}
            rightActions={[
              {
                key: 'edit',
                label: 'Izmeni',
                icon: 'create-outline',
                accessibilityLabel: 'Izmeni podatke o matici',
                onPress: () => {
                  router.push({
                    pathname:
                      '/hives/[hiveId]/colonies/[colonyId]/queens/[queenId]/edit',
                    params: {
                      hiveId,
                      colonyId,
                      queenId,
                    },
                  } as never);
                },
              },
              {
                key: 'more',
                label: 'Više',
                icon: 'ellipsis-horizontal',
                accessibilityLabel: 'Prikaži više opcija za maticu',
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
              ← Pčelinje društvo
            </Text>
          </Pressable>

          <Text className="text-xs font-bold uppercase tracking-widest text-muted">
            Matica
          </Text>

          <View className="mt-2 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold tracking-tight text-foreground">
                Matica
              </Text>

              <View className="mt-3 self-start rounded-full bg-primary/10 px-3 py-1.5">
                <Text className="text-xs font-bold text-primary">
                  {getQueenStatusLabel(queen.status)}
                </Text>
              </View>
            </View>

            <QueenHeaderIllustration
              markingColorHex={queen.markingColorHex}
            />
          </View>

          <SectionTitle>Osnovni podaci</SectionTitle>
          <DetailsCard>
            <InfoRow label="Poreklo" value={getQueenOriginLabel(queen.origin)} />
            <InfoRow label="Odgajivač" value={queen.breeder ?? '—'} />
            <InfoRow label="Rasa" value={queen.breed ?? '—'} />
            <InfoRow label="Izlegla se" value={formatDate(queen.emergedOn)} />
            <InfoRow label="Nabavljena" value={formatDate(queen.acquiredOn)} />
            <InfoRow label="Status" value={getQueenStatusLabel(queen.status)} last />
          </DetailsCard>

          <SectionTitle>Trenutni boravak</SectionTitle>
          <DetailsCard>
            <InfoRow label="U društvu od" value={formatDate(queen.startedOn)} />
            <InfoRow label="Način dodavanja" value={getIntroductionMethodLabel(queen.introductionMethod)} />
            <InfoRow label="Ishod dodavanja" value={getIntroductionOutcomeLabel(queen.introductionOutcome)} />
            <InfoRow label="Napomena o boravku" value={queen.stayNotes ?? '—'} last />
          </DetailsCard>

          {queen.notes && (
            <>
              <SectionTitle>Napomena o matici</SectionTitle>
              <DetailsCard>
                <Text className="text-base leading-6 text-foreground">
                  {queen.notes}
                </Text>
              </DetailsCard>
            </>
          )}
        </ScrollView>
      </Screen>

      <ActionOverflowSheet
        visible={isMoreOpen}
        onClose={() => {
          setIsMoreOpen(false);
        }}
        title="Matica"
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
    <View className={last ? 'py-4' : 'border-b border-border py-4'}>
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </Text>

      {typeof value === 'string' ? (
        <Text className="mt-1 text-base text-foreground">
          {value}
        </Text>
      ) : (
        <View className="mt-2">{value}</View>
      )}
    </View>
  );
}
