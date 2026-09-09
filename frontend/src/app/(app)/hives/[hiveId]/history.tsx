import { useLocalSearchParams } from "expo-router";

import { HiveActionHistoryScreen } from "@/features/hive-inspections/screens/hive-action-history-screen";

export default function HiveActionHistoryRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();

  return <HiveActionHistoryScreen hiveId={hiveId} />;
}
