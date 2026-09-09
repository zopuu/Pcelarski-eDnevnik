import { useLocalSearchParams } from "expo-router";

import { RecordHiveInspectionScreen } from "@/features/hive-inspections/screens/record-hive-inspection-screen";

export default function RecordHiveInspectionRoute() {
  const { hiveId } = useLocalSearchParams<{
    hiveId: string;
  }>();

  return <RecordHiveInspectionScreen hiveId={hiveId} />;
}
