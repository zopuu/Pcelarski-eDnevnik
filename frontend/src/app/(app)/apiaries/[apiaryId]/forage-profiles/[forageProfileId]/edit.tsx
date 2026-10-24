import { useLocalSearchParams } from 'expo-router';

import { EditForageProfileScreen } from '@/features/apiaries/screens/edit-forage-profile-screen';

export default function EditForageProfileRoute() {
  const { apiaryId, forageProfileId, year } = useLocalSearchParams<{
    apiaryId: string;
    forageProfileId: string;
    year: string;
  }>();

  return (
    <EditForageProfileScreen
      apiaryId={apiaryId}
      forageProfileId={forageProfileId}
      year={Number(year)}
    />
  );
}
