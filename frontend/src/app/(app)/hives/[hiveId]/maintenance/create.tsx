import { useLocalSearchParams } from "expo-router";

import { RecordHiveMaintenanceScreen } from "@/features/hive-maintenance/screens/record-hive-maintenance-screen";

export default function RecordHiveMaintenanceRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();
  return <RecordHiveMaintenanceScreen hiveId={hiveId} />;
}
