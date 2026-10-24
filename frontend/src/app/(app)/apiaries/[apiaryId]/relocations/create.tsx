import { useLocalSearchParams } from 'expo-router';

import { CreateRelocationScreen } from '@/features/relocations/screens/create-relocation-screen';

export default function CreateRelocationRoute() {
  const { apiaryId } = useLocalSearchParams<{
    apiaryId: string;
  }>();

  return <CreateRelocationScreen apiaryId={apiaryId} />;
}
