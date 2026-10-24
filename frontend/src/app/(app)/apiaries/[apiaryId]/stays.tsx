import { useLocalSearchParams } from 'expo-router';

import { ApiaryStayHistoryScreen } from '@/features/apiaries/screens/apiary-stay-history-screen';

export default function ApiaryStayHistoryRoute() {
  const { apiaryId } = useLocalSearchParams<{
    apiaryId: string;
  }>();

  return <ApiaryStayHistoryScreen apiaryId={apiaryId} />;
}
