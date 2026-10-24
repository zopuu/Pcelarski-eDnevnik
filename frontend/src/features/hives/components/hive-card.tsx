import Ionicons from '@react-native-vector-icons/ionicons';

import { Pressable, Text, View } from 'react-native';

import type { HiveStatus, HiveType } from '../types/hive';
import { HiveHeaderIllustration } from './hive-header-illustration';
import { colors } from '@/shared/theme/colors';

type HiveCardProps = {
  label: string;

  identificationNumber: string | null;

  type: HiveType;

  colorHex: string | null;

  status: HiveStatus;

  onPress: () => void;

  selectionMode?: boolean;

  selected?: boolean;
};

const typeLabels: Record<HiveType, string> = {
  dadantBlatt: 'DB',
  langstrothRoot: 'LR',
  albertiZnidersic: 'AŽ',
  farrar: 'Farar',
  nucleus: 'Nukleus',
  other: 'Ostalo',
};

const statusLabels: Record<HiveStatus, string> = {
  active: 'Aktivna',
  inactive: 'Neaktivna',
  writtenOff: 'Rashodovana',
  underRepair: 'Na popravci',
};

export function HiveCard({
  label,
  identificationNumber,
  type,
  colorHex,
  status,
  onPress,
  selectionMode = false,
  selected = false,
}: HiveCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="
        min-h-24
        flex-row
        items-center
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-surface
        active:opacity-80
      "
    >
      <View
        className="
          h-full
          w-2
        "
        style={{
          backgroundColor: colors.primary,
        }}
      />

      <View
        className="
          ml-4
          h-14
          w-14
          items-center
          justify-center
        "
      >
        <HiveHeaderIllustration colorHex={colorHex} size={56} accessible={false} />
      </View>

      <View
        className="
          flex-1
          px-4
          py-4
        "
      >
        <View
          className="
            flex-row
            items-center
            gap-2
          "
        >
          <Text
            numberOfLines={1}
            className="
              flex-shrink
              text-lg
              font-bold
              text-foreground
            "
          >
            {label}
          </Text>

          <View
            className="
              rounded-full
              bg-primary/10
              px-2.5
              py-1
            "
          >
            <Text
              className="
                text-xs
                font-bold
                text-primary
              "
            >
              {typeLabels[type]}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          className="
            mt-1
            text-sm
            text-muted
          "
        >
          {identificationNumber ?? 'Bez identifikacionog broja'}
        </Text>

        <Text
          className="
            mt-1
            text-xs
            font-semibold
            text-muted
          "
        >
          {statusLabels[status]}
        </Text>
      </View>

      {selectionMode ? (
        <View
          accessibilityElementsHidden
          className={`
            mr-4
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            border
            ${selected ? 'border-primary bg-primary' : 'border-border bg-surface'}
          `}
        >
          {selected && <Ionicons name="checkmark" size={18} color={colors.onPrimary} />}
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={22}
          color="#8E8577"
          style={{
            marginRight: 16,
          }}
        />
      )}
    </Pressable>
  );
}
