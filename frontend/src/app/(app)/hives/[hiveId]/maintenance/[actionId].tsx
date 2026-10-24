import { useLocalSearchParams } from 'expo-router';

import { HiveMaintenanceDetailsScreen } from '@/features/hive-maintenance/screens/hive-maintenance-details-screen';

export default function HiveMaintenanceDetailsRoute() {
  const { hiveId, actionId } = useLocalSearchParams<{
    hiveId: string;
    actionId: string;
  }>();
  return <HiveMaintenanceDetailsScreen hiveId={hiveId} actionId={actionId} />;
}
