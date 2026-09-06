import {
  useLocalSearchParams,
} from 'expo-router';

import {
  EditHiveScreen,
} from '@/features/hives/screens/edit-hive-screen';

export default function EditHiveRoute() {
  const {
    hiveId,
  } = useLocalSearchParams<{
    hiveId: string;
  }>();

  return <EditHiveScreen hiveId={hiveId} />;
}
