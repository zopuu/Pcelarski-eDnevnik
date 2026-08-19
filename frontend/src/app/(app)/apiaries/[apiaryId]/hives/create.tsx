import {
    useLocalSearchParams,
} from 'expo-router';

import {
    CreateHiveScreen,
} from '@/features/hives/screens/create-hive-screen';

export default function CreateHiveRoute() {
  const {
    apiaryId,
  } =
    useLocalSearchParams<{
      apiaryId: string;
    }>();

  return (
    <CreateHiveScreen
      apiaryId={
        apiaryId
      }
    />
  );
}