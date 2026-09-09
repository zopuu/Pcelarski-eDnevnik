import { useLocalSearchParams } from "expo-router";

import { HiveInspectionDetailsScreen } from "@/features/hive-inspections/screens/hive-inspection-details-screen";

export default function HiveInspectionDetailsRoute() {
  const { hiveId, inspectionId } = useLocalSearchParams<{
    hiveId: string;
    inspectionId: string;
  }>();

  return (
    <HiveInspectionDetailsScreen hiveId={hiveId} inspectionId={inspectionId} />
  );
}
