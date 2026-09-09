import { useLocalSearchParams } from 'expo-router';

import { HiveSuperManagementScreen } from '@/features/hive-supers/screens/hive-super-management-screen';

export default function HiveSuperManagementRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();

  return <HiveSuperManagementScreen hiveId={hiveId} />;
}
