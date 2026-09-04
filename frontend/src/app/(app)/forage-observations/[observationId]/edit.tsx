import {
  useLocalSearchParams,
} from 'expo-router';

import {
  CreateForageObservationScreen,
} from '@/features/forage-observations/screens/create-forage-observation-screen';

export default function EditForageObservationRoute() {
  const {
    observationId,
  } = useLocalSearchParams<{
    observationId: string;
  }>();

  return (
    <CreateForageObservationScreen
      observationId={observationId}
    />
  );
}
