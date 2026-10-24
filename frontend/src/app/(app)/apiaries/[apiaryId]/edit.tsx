import { useLocalSearchParams } from 'expo-router';

import { EditApiaryScreen } from '@/features/apiaries/screens/edit-apiary-screen';

export default function EditApiaryRoute() {
  const { apiaryId } = useLocalSearchParams<{
    apiaryId: string;
  }>();

  return <EditApiaryScreen apiaryId={apiaryId} />;
}
