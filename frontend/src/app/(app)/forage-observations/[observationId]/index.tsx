import { useLocalSearchParams } from 'expo-router';

import { ForageObservationDetailsScreen } from '@/features/forage-observations/screens/forage-observation-details-screen';

export default function ForageObservationDetailsRoute() {
  const { observationId } = useLocalSearchParams<{
    observationId: string;
  }>();

  return <ForageObservationDetailsScreen observationId={observationId} />;
}
