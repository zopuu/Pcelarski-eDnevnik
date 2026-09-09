import { useLocalSearchParams } from 'expo-router';

import { HiveInsulationDetailsScreen } from '@/features/hive-insulation/screens/hive-insulation-details-screen';

export default function HiveInsulationDetailsRoute() {
  const { hiveId, actionId } = useLocalSearchParams<{
    hiveId: string;
    actionId: string;
  }>();

  return <HiveInsulationDetailsScreen hiveId={hiveId} actionId={actionId} />;
}
