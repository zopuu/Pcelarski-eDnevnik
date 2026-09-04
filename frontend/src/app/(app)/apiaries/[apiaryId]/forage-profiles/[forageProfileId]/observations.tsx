import {
  useLocalSearchParams,
} from 'expo-router';

import {
  ForageObservationsScreen,
} from '@/features/forage-observations/screens/forage-observations-screen';

export default function ForageProfileObservationsRoute() {
  const {
    forageProfileId,
  } = useLocalSearchParams<{
    forageProfileId: string;
  }>();

  return (
    <ForageObservationsScreen
      forageProfileId={forageProfileId}
    />
  );
}
