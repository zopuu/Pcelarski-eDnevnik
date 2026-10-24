import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { colors } from '@/shared/theme/colors';
import type { HarvestSource } from '../types/harvest';
import { formatPeriod } from '../utils/harvest-format';

export function HarvestSourceList({ sources }: { sources: HarvestSource[] }) {
  if (sources.length === 0) {
    return <Text className="text-sm text-muted">Izvori nisu dostupni.</Text>;
  }

  const sourceGroups = Array.from(
    sources.reduce((groups, source) => {
      const key = source.hiveId ?? source.hiveLabel ?? source.hiveSuperStayId;
      const current = groups.get(key) ?? [];
      current.push(source);
      groups.set(key, current);
      return groups;
    }, new Map<string, HarvestSource[]>()),
  );

  return (
    <View className="gap-3">
      {sourceGroups.map(([key, group]) => (
        <View key={key} className="overflow-hidden rounded-3xl border border-border bg-surface">
          <View className="flex-row items-center gap-3 bg-surface-warm px-4 py-3">
            <Ionicons name="home-outline" size={20} color={colors.primary} />
            <Text className="flex-1 text-base font-bold text-foreground">
              {group[0]?.hiveLabel || 'Košnica bez oznake'}
            </Text>
            <Text className="text-xs font-semibold text-muted">Broj nastavaka: {group.length}</Text>
          </View>
          {group.map((source, index) => (
            <HarvestSourceItem
              key={`${source.hiveSuperStayId}-${index}`}
              source={source}
              position={index + 1}
              separated={index > 0}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function HarvestSourceItem({
  source,
  position,
  separated,
}: {
  source: HarvestSource;
  position: number;
  separated: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View className={`${separated ? 'border-t border-border' : ''} px-4 py-4`}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">Nastavak {position}</Text>
          <Text className="mt-1 text-sm text-muted">
            Nastavak · {formatPeriod(source.superStayStartedOn, source.superStayEndedOn)}
          </Text>
        </View>
        <View className="rounded-xl bg-primary/10 px-3 py-2">
          <Text className="font-bold text-primary">{source.framesHarvested} ram.</Text>
        </View>
      </View>

      {source.exposureSegments.length > 0 && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => setExpanded((value) => !value)}
            className="mt-3 min-h-11 flex-row items-center gap-2 border-t border-border pt-3"
          >
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text className="flex-1 text-sm font-semibold text-primary">
              {expanded ? 'Sakrij istoriju lokacija' : 'Istorija lokacija'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={17}
              color={colors.primary}
            />
          </Pressable>
          {expanded && (
            <View className="mt-2 rounded-2xl bg-background px-4 py-3">
              {source.exposureSegments.map((segment, index) => (
                <View
                  key={`${segment.apiaryStayId}-${index}`}
                  className={index > 0 ? 'mt-3 border-t border-border pt-3' : ''}
                >
                  <Text className="font-semibold text-foreground">
                    {segment.locationName || 'Lokacija bez naziva'}
                  </Text>
                  <Text className="mt-1 text-xs text-muted">
                    {formatPeriod(segment.startedOn, segment.endedOn)} · {segment.durationDays} dana
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}
