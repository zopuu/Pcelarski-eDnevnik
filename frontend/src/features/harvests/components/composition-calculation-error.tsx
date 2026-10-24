import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import type { CompositionCalculationIssue } from '../types/harvest';

const issueMessages: Record<string, (year?: number) => string> = {
  'composition.no_harvest_sources': () => 'Za ovu seriju nisu pronađeni podaci o izvoru vrcanja.',
  'composition.source_resolution_failed': () => 'Nije moguće pouzdano utvrditi poreklo dela meda.',
  'composition.no_exposure': () => 'Nedostaju podaci o boravku nastavaka na pčelinjaku.',
  'composition.forage_profile_missing': (year) =>
    year
      ? `Nedostaje profil paše za ${year}. godinu.`
      : 'Nedostaje profil paše za deo perioda porekla meda.',
  'composition.forage_profile_empty': () => 'Profil paše ne sadrži podatke potrebne za proračun.',
  'composition.forage_profile_invalid': () => 'Podaci profila paše nisu validni za proračun.',
  'composition.no_calculable_data': () => 'Nema dovoljno podataka za pouzdanu procenu sastava.',
};

export function CompositionCalculationError({
  issues,
  onManual,
  onLaboratory,
}: {
  issues: CompositionCalculationIssue[];
  onManual: () => void;
  onLaboratory: () => void;
}) {
  const messages = [
    ...new Set(
      issues
        .map((issue) => issueMessages[issue.code]?.(issue.year))
        .filter((message): message is string => Boolean(message)),
    ),
  ];

  return (
    <View className="rounded-3xl border border-warning/30 bg-surface px-5 py-5">
      <Ionicons name="information-circle-outline" size={30} color={colors.warning} />
      <Text className="mt-3 text-lg font-bold text-foreground">Sastav nije moguće izračunati</Text>
      <Text className="mt-1 text-sm leading-5 text-muted">
        Nema dovoljno pouzdanih podataka za automatski proračun sastava.
      </Text>
      {messages.map((message) => (
        <Text key={message} className="mt-2 text-sm leading-5 text-foreground">
          • {message}
        </Text>
      ))}
      <View className="mt-5 gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={onManual}
          className="min-h-12 items-center justify-center rounded-2xl bg-primary px-4"
        >
          <Text className="font-bold text-background">Unesi sastav ručno</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onLaboratory}
          className="min-h-12 items-center justify-center rounded-2xl border border-border bg-surface px-4"
        >
          <Text className="font-bold text-foreground">Laboratorijski nalaz</Text>
        </Pressable>
      </View>
    </View>
  );
}
