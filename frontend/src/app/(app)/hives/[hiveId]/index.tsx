import { useLocalSearchParams } from 'expo-router';

import { HiveDetailsScreen } from '@/features/hives/screens/hive-details-screen';

export default function HiveDetailsRoute() {
  const { hiveId } = useLocalSearchParams<{
    hiveId: string;
  }>();

  return <HiveDetailsScreen hiveId={hiveId} />;
}
