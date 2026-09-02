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
    useHive,
} from '../hooks/use-hive';

import {
    useAppDrawer,
} from '@/providers/app-drawer-provider';

import {
    ActionOverflowSheet,
} from '@/shared/components/contextual-action-bar/action-overflow-sheet';

import {
    ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';
import {
    ContextualAction
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

type HiveDetailsScreenProps = {
    hiveId: string;
};

const hiveTypeLabels:
    Record<string, string> = {
    dadantBlatt: 'DB',
    langstrothRoot: 'LR',
    albertiZnidersic: 'AŽ',
    farrar: 'Farar',
    nucleus: 'Nukleus',
    other: 'Ostalo',
};

const hiveMaterialLabels:
    Record<string, string> = {
    wood: 'Drvo',
    polystyrene:
        'Polistiren',
    polyurethane:
        'Poliuretan',
    plastic: 'Plastika',
    other: 'Ostalo',
};

function getHiveTypeLabel(
    value: string,
) {
    return (
        hiveTypeLabels[
        value
        ] ??
        value
    );
}

function getHiveMaterialLabel(
    value:
        | string
        | null,
) {
    if (!value) {
        return '—';
    }

    return (
        hiveMaterialLabels[
        value
        ] ??
        value
    );
}

function getHiveStatusLabel(
    value: string,
) {
    switch (
    value.toLowerCase()
    ) {
        case 'active':
            return 'Aktivna';

        case 'inactive':
            return 'Neaktivna';

        case 'deactivated':
            return 'Deaktivirana';

        default:
            return value;
    }
}

function formatDate(
    value:
        | string
        | null,
) {
    if (!value) {
        return '—';
    }

    const [
        year,
        month,
        day,
    ] =
        value.split('-');

    if (
        !year ||
        !month ||
        !day
    ) {
        return value;
    }

    return `${day}.${month}.${year}.`;
}

function formatFeederVolume(
    value:
        | number
        | null,
) {
    if (value === null) {
        return '—';
    }

    const liters =
        value / 1000;

    const formatted =
        liters
            .toFixed(2)
            .replace(
                /\.?0+$/,
                '',
            )
            .replace(
                '.',
                ',',
            );

    return `${formatted} l`;
}

export function HiveDetailsScreen({
    hiveId,
}: HiveDetailsScreenProps) {
    const {
        openDrawer,
    } =
        useAppDrawer();

    const [
        isMoreOpen,
        setIsMoreOpen,
    ] =
        useState(false);

    const {
        data: hive,
        isLoading,
        isError,
        refetch,
    } =
        useHive(
            hiveId,
        );

    const header = (
        <AppHeader
            onMenuPress={
                openDrawer
            }
        />
    );

    if (isLoading) {
        return (
            <Screen
                header={header}
            >
                <View
                    className="
            flex-1
            items-center
            justify-center
          "
                >
                    <ActivityIndicator
                        size="large"
                        color={
                            colors.primary
                        }
                    />

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

    if (
        isError ||
        !hive
    ) {
        return (
            <Screen
                header={header}
            >
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
                        Nije moguće učitati
                        podatke o košnici.
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

    const isActive =
        String(
            hive.status,
        ).toLowerCase() ===
        'active';

    const handleStaysPress =
        () => {
            Alert.alert(
                'Istorija boravaka',
                'Prikaz boravaka košnice biće povezan kada implementiramo Hive Stay istoriju.',
            );
        };

    const handleRelocationsPress =
        () => {
            Alert.alert(
                'Selidbe',
                'Prikaz selidbi košnice biće povezan kada implementiramo selidbe.',
            );
        };

    const handleHiveActionsPress =
        () => {
            Alert.alert(
                'Akcije nad košnicom',
                'Ovde će kasnije biti pregled, prihrana, tretman varoe, upravljanje nastavcima i ostale akcije.',
            );
        };

    const handleHistoryPress =
        () => {
            Alert.alert(
                'Istorija aktivnosti',
                'Ovde će biti hronološka istorija pregleda, prihrana, tretmana i drugih akcija.',
            );
        };

    const handleEditPress =
        () => {
            setIsMoreOpen(
                false,
            );

            Alert.alert(
                'Izmena košnice',
                'Ekran za izmenu košnice još nije implementiran.',
            );
        };

    const handleDeactivatePress =
        () => {
            setIsMoreOpen(
                false,
            );

            Alert.alert(
                'Deaktiviraj košnicu',
                'Deaktiviranje košnice biće povezano kada implementiramo odgovarajući backend workflow.',
            );
        };

    const handleDeletePress =
        () => {
            Alert.alert(
                'Obriši košnicu',
                'Da li sigurno želite da obrišete ovu košnicu?',
                [
                    {
                        text: 'Otkaži',
                        style:
                            'cancel',
                    },

                    {
                        text: 'Obriši',
                        style:
                            'destructive',

                        onPress:
                            () => {
                                setIsMoreOpen(
                                    false,
                                );

                                Alert.alert(
                                    'Brisanje',
                                    'Backend brisanje košnice još nije implementirano.',
                                );
                            },
                    },
                ],
            );
        };

    const moreActions:
        ContextualAction[] = [
            {
                key: 'edit',

                label: 'Izmeni',

                icon:
                    'create-outline',

                accessibilityLabel:
                    'Izmeni podatke o košnici',

                onPress:
                    handleEditPress,
            },
        ];

    if (isActive) {
        moreActions.push({
            key: 'deactivate',

            label:
                'Deaktiviraj',

            icon:
                'power-outline',

            accessibilityLabel:
                'Deaktiviraj košnicu',

            onPress:
                handleDeactivatePress,
        });
    }

    moreActions.push({
        key: 'delete',

        label: 'Obriši',

        icon:
            'trash-outline',

        accessibilityLabel:
            'Obriši košnicu',

        variant:
            'danger',

        onPress:
            handleDeletePress,
    });
    return (
        <>
            <Screen
                header={header}
                contextualActionBar={
                    <ContextualActionBar
                        leftActions={[
                            {
                                key:
                                    'stays',

                                label:
                                    'Boravci',

                                icon:
                                    'time-outline',

                                accessibilityLabel:
                                    'Prikaži istoriju boravaka košnice',

                                onPress:
                                    handleStaysPress,
                            },

                            {
                                key:
                                    'relocations',

                                label:
                                    'Selidbe',

                                icon:
                                    'swap-horizontal-outline',

                                accessibilityLabel:
                                    'Prikaži selidbe košnice',

                                onPress:
                                    handleRelocationsPress,
                            },
                        ]}
                        primaryAction={{
                            key:
                                'actions',

                            label:
                                'Akcije',

                            icon:
                                'construct-outline',

                            accessibilityLabel:
                                'Otvori akcije nad košnicom',

                            onPress:
                                handleHiveActionsPress,
                        }}
                        rightActions={[
                            {
                                key:
                                    'history',

                                label:
                                    'Istorija',

                                icon:
                                    'reader-outline',

                                accessibilityLabel:
                                    'Prikaži istoriju aktivnosti košnice',

                                onPress:
                                    handleHistoryPress,
                            },

                            {
                                key:
                                    'more',

                                label:
                                    'Više',

                                icon:
                                    'ellipsis-horizontal',

                                accessibilityLabel:
                                    'Prikaži više opcija za košnicu',

                                onPress:
                                    () => {
                                        setIsMoreOpen(
                                            true,
                                        );
                                    },
                            },
                        ]}
                    />
                }
            >
                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={{
                        paddingHorizontal:
                            16,

                        paddingBottom:
                            32,
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
                                        {getHiveTypeLabel(
                                            String(
                                                hive.type,
                                            ),
                                        )}
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
                                        {getHiveStatusLabel(
                                            String(
                                                hive.status,
                                            ),
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {hive.colorHex ? (
                            <View
                                accessibilityLabel={`Boja košnice ${hive.colorHex}`}
                                className="
                  h-14
                  w-14
                  rounded-2xl
                  border
                  border-border
                "
                                style={{
                                    backgroundColor:
                                        hive.colorHex,
                                }}
                            />
                        ) : (
                            <View
                                className="
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-border
                  bg-surface
                "
                            >
                                <Text
                                    className="
                    text-xs
                    text-muted
                  "
                                >
                                    Bez boje
                                </Text>
                            </View>
                        )}
                    </View>

                    <SectionTitle>
                        Osnovni podaci
                    </SectionTitle>

                    <DetailsCard>
                        <InfoRow
                            label="Identifikacioni broj"
                            value={
                                hive
                                    .identificationNumber ??
                                '—'
                            }
                        />

                        <InfoRow
                            label="Tip"
                            value={getHiveTypeLabel(
                                String(
                                    hive.type,
                                ),
                            )}
                        />

                        <InfoRow
                            label="Proizvođač"
                            value={
                                hive.manufacturer ??
                                '—'
                            }
                        />

                        <InfoRow
                            label="Materijal"
                            value={getHiveMaterialLabel(
                                hive.material
                                    ? String(
                                        hive.material,
                                    )
                                    : null,
                            )}
                        />

                        <InfoRow
                            label="Datum proizvodnje"
                            value={formatDate(
                                hive
                                    .manufactureDate,
                            )}
                        />

                        <InfoRow
                            label="Datum nabavke"
                            value={formatDate(
                                hive.purchaseDate,
                            )}
                            last
                        />
                    </DetailsCard>

                    <SectionTitle>
                        Nastavci
                    </SectionTitle>

                    <DetailsCard>
                        <View
                            className="
                flex-row
                items-center
                justify-between
                gap-4
                py-1
              "
                        >
                            <View>
                                <Text
                                    className="
                    text-sm
                    font-semibold
                    text-muted
                  "
                                >
                                    Trenutno na košnici
                                </Text>

                                <Text
                                    className="
                    mt-1
                    text-xs
                    text-muted
                  "
                                >
                                    Upravljanje nastavcima
                                    još nije implementirano.
                                </Text>
                            </View>

                            <Text
                                className="
                  text-4xl
                  font-bold
                  text-foreground
                "
                            >
                                —
                            </Text>
                        </View>
                    </DetailsCard>

                    <SectionTitle>
                        Hranilica
                    </SectionTitle>

                    <View
                        className="
              flex-row
              gap-3
            "
                    >
                        <MetricCard
                            label="Hranilica"
                            value={
                                hive.hasFeeder
                                    ? 'Ima'
                                    : 'Nema'
                            }
                        />

                        <MetricCard
                            label="Kapacitet"
                            value={
                                hive.hasFeeder
                                    ? formatFeederVolume(
                                        hive.feederVolumeMl,
                                    )
                                    : '—'
                            }
                        />
                    </View>

                    <SectionTitle>
                        Društvo i matica
                    </SectionTitle>

                    <DetailsCard>
                        <PlaceholderEntity
                            title="Pčelinje društvo"
                            description="Trenutno društvo u košnici biće prikazano kada implementiramo modul društava."
                        />

                        <View
                            className="
                my-4
                h-px
                bg-border
              "
                        />

                        <PlaceholderEntity
                            title="Matica"
                            description="Podaci o trenutnoj matici biće prikazani nakon povezivanja društava i matica."
                        />
                    </DetailsCard>

                    {hive.note && (
                        <>
                            <SectionTitle>
                                Napomena
                            </SectionTitle>

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
                visible={
                    isMoreOpen
                }
                onClose={() => {
                    setIsMoreOpen(
                        false,
                    );
                }}
                title={`Košnica ${hive.label}`}
                actions={
                    moreActions
                }
            />
        </>
    );
}

type SectionTitleProps = {
    children:
    React.ReactNode;
};

function SectionTitle({
    children,
}: SectionTitleProps) {
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
    children:
    React.ReactNode;
};

function DetailsCard({
    children,
}: DetailsCardProps) {
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
    value: string;
    last?: boolean;
};

function InfoRow({
    label,
    value,
    last = false,
}: InfoRowProps) {
    return (
        <View
            className={`
        flex-row
        items-start
        justify-between
        gap-6
        py-3
        ${last
                    ? ''
                    : 'border-b border-border'
                }
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
        </View>
    );
}

type MetricCardProps = {
    label: string;
    value: string;
};

function MetricCard({
    label,
    value,
}: MetricCardProps) {
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

type PlaceholderEntityProps = {
    title: string;
    description: string;
};

function PlaceholderEntity({
    title,
    description,
}: PlaceholderEntityProps) {
    return (
        <View>
            <View
                className="
          flex-row
          items-center
          justify-between
          gap-4
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

                <View
                    className="
            rounded-full
            border
            border-border
            px-2.5
            py-1
          "
                >
                    <Text
                        className="
              text-xs
              font-semibold
              text-muted
            "
                    >
                        Uskoro
                    </Text>
                </View>
            </View>

            <Text
                className="
          mt-2
          text-sm
          leading-5
          text-muted
        "
            >
                {description}
            </Text>
        </View>
    );
}