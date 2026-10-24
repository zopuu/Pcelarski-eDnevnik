import { useLocalSearchParams } from 'expo-router';

import { ColonyDetailsScreen } from '@/features/colonies/screens/colony-details-screen';

export default function ColonyDetailsRoute() {
  const { hiveId, colonyId } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
  }>();

  return <ColonyDetailsScreen hiveId={hiveId} colonyId={colonyId} />;
}
