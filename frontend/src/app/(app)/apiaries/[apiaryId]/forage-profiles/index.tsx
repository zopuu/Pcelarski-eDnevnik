import { useLocalSearchParams } from 'expo-router';

import { ForageProfileDetailsScreen } from '@/features/apiaries/screens/forage-profile-details-screen';

export default function ForageProfileDetailsRoute() {
  const { apiaryId } = useLocalSearchParams<{
    apiaryId: string;
  }>();

  return <ForageProfileDetailsScreen apiaryId={apiaryId} />;
}
