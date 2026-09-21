import Ionicons from '@react-native-vector-icons/ionicons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useState } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
} from 'expo-image';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/theme/colors';
import { environment } from '@/shared/config/environment';

type ApiaryCardProps = {
  name: string;
  imageUrl: string | null;
  isInactive: boolean;
  onPress: () => void;
};

type HoneycombPatternProps = {
  width: number;
  height: number;
  hexSize?: number;
};

function getHexPath(
  cx: number,
  cy: number,
  size: number,
) {
  const halfHeight =
    (Math.sqrt(3) * size) / 2;

  const points = [
    [cx - size, cy],
    [cx - size / 2, cy - halfHeight],
    [cx + size / 2, cy - halfHeight],
    [cx + size, cy],
    [cx + size / 2, cy + halfHeight],
    [cx - size / 2, cy + halfHeight],
  ];

  return `
    M ${points[0][0]} ${points[0][1]}
    L ${points[1][0]} ${points[1][1]}
    L ${points[2][0]} ${points[2][1]}
    L ${points[3][0]} ${points[3][1]}
    L ${points[4][0]} ${points[4][1]}
    L ${points[5][0]} ${points[5][1]}
    Z
  `;
}

function HoneycombPattern({
  width,
  height,
  hexSize = 16,
}: HoneycombPatternProps) {
  const hexHeight =
    Math.sqrt(3) * hexSize;

  const horizontalStep =
    hexSize * 1.5;

  const verticalStep =
    hexHeight;

  const columns =
    Math.ceil(width / horizontalStep) + 2;

  const rows =
    Math.ceil(height / verticalStep) + 2;

  const hexagons = [];

  for (let col = 0; col < columns; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x =
        col * horizontalStep;

      const y =
        row * verticalStep +
        (col % 2 === 0
          ? 0
          : verticalStep / 2);

      hexagons.push(
        <Path
          key={`${col}-${row}`}
          d={getHexPath(x, y, hexSize)}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1}
        />,
      );
    }
  }

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {hexagons}
      </Svg>
    </View>
  );
}

export function ApiaryCard({
  name,
  imageUrl,
  isInactive,
  onPress,
}: ApiaryCardProps) {
  const displayName = name;
  const [cardSize, setCardSize] = useState({
    width: 0,
    height: 0,
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive }}
      accessibilityLabel={isInactive
        ? `${displayName}, trajno deaktiviran pčelinjak`
        : `Otvori pčelinjak ${displayName}`}
      onLayout={(event) => {
        const {
          width,
          height,
        } = event.nativeEvent.layout;

        setCardSize({
          width,
          height,
        });
      }}
      className="
    h-36
    overflow-hidden
    rounded-[28px]
    border
    border-white/80
    active:opacity-90
  "
      style={[
        styles.cardShadow,
        isInactive && styles.inactiveCard,
      ]}
    >
      {/* Main background: left lighter, right darker */}
      <LinearGradient
        colors={[
          '#F7EFD0',
          '#EFCB73',
          '#D9A42A',
          '#9A650A',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Full honeycomb texture */}
      {cardSize.width > 0 &&
        cardSize.height > 0 && (
          <HoneycombPattern
            width={cardSize.width}
            height={cardSize.height}
            hexSize={16}
          />
        )}

      {/* Very soft top light */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.22)',
          'rgba(255,255,255,0.08)',
          'rgba(255,255,255,0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topLight}
      />

      {/* Soft central glow line */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0)',
          'rgba(255,248,220,0.35)',
          'rgba(255,255,255,0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.middleGlow}
      />

      {imageUrl ? (
        <Image
          pointerEvents="none"
          source={`${environment.apiUrl}${imageUrl}`}
          contentFit="cover"
          style={styles.rightImage}
        />
      ) : (
        <>
          <View
            pointerEvents="none"
            style={styles.rightCircle}
          />

          <View
            pointerEvents="none"
            style={styles.iconBox}
          >
          <MaterialDesignIcons
            name="beehive-outline"
            size={36}
            color="#B06D08"
          />
          </View>
        </>
      )}

      {/* Bottom fade for title */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(60, 38, 8, 0.16)',
          'rgba(60, 38, 8, 0.72)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bottomFade}
      />

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          className="
            flex-1
            text-xl
            font-bold
            text-white
          "
        >
          {displayName}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={24}
          color={colors.white}
        />
      </View>

      {isInactive && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveBadgeText}>
            Deaktiviran
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    backgroundColor: '#DCA01D',
    shadowColor: '#6A4300',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },

  inactiveCard: {
    opacity: 0.58,
  },

  inactiveBadge: {
    position: 'absolute',
    top: 14,
    left: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(60, 38, 8, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  inactiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  topLight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 48,
  },

  middleGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    height: 20,
  },

  rightCircle: {
    position: 'absolute',
    right: -26,
    top: -10,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  iconBox: {
    position: 'absolute',
    right: 24,
    top: 28,
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  rightImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '47%',
  },

  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
  },

  content: {
    position: 'absolute',
    left: 20,
    right: 18,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
