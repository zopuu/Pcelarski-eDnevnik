import {
  useLocalSearchParams,
} from 'expo-router';

import {
  CreateForageProfileScreen,
} from '@/features/apiaries/screens/create-forage-profile-screen';

export default function CreateForageProfileRoute() {
  const {
    apiaryId,
  } = useLocalSearchParams<{
    apiaryId: string;
  }>();

  return (
    <CreateForageProfileScreen
      apiaryId={apiaryId}
    />
  );
}
