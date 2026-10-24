import { useLocalSearchParams } from 'expo-router';

import { ApiaryHivesScreen } from '@/features/apiaries/screens/apiary-details-screen';

export default function ApiaryDetailsRoute() {
  const { apiaryId } = useLocalSearchParams<{
    apiaryId: string;
  }>();

  return <ApiaryHivesScreen apiaryId={apiaryId} />;
}
