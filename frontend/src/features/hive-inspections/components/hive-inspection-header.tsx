import { ActivityIndicator, Text, View } from "react-native";

import { HiveHeaderIllustration } from "@/features/hives/components/hive-header-illustration";
import type { HiveDetails } from "@/features/hives/types/hive-details";
import { QueenHeaderIllustration } from "@/features/queens/components/queen-header-illustration";
import type { CurrentQueen } from "@/features/queens/types/queen";
import { colors } from "@/shared/theme/colors";

const hiveTypeLabels: Record<string, string> = {
  dadantBlatt: "DB",
  langstrothRoot: "LR",
  albertiZnidersic: "AŽ",
  farrar: "Farar",
  nucleus: "Nukleus",
  other: "Ostalo",
};

type HiveInspectionHeaderProps = {
  hive: HiveDetails;
  queen: CurrentQueen | null;
  isQueenLoading: boolean;
};

export function HiveInspectionHeader({
  hive,
  queen,
  isQueenLoading,
}: HiveInspectionHeaderProps) {
  return (
    <View className="mt-5 flex-row items-center rounded-3xl border border-border bg-surface px-3 py-4">
      <View className="flex-1 pl-1">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Košnica
        </Text>
        <Text
          numberOfLines={2}
          className="mt-1 text-lg font-bold text-foreground"
        >
          {hive.label}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-primary">
          {hiveTypeLabels[hive.type] ?? hive.type}
        </Text>
      </View>

      <View className="items-center px-1">
        <HiveHeaderIllustration
          colorHex={hive.colorHex}
          size={82}
          accessible={false}
        />
      </View>

      <View className="flex-1 items-center">
        {isQueenLoading ? (
          <View className="h-[72px] items-center justify-center">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View
            style={{
              opacity: queen ? 1 : 0.28,
            }}
          >
            <QueenHeaderIllustration
              markingColorHex={queen?.markingColorHex ?? null}
              size={72}
            />
          </View>
        )}
        <Text className="mt-1 text-center text-xs font-semibold text-muted">
          {queen ? "Matica prisutna" : "Nema matice"}
        </Text>
      </View>
    </View>
  );
}
