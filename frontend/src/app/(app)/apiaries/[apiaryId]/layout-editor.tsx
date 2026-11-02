import { useLocalSearchParams } from 'expo-router';

import { ApiaryLayoutEditorScreen } from '@/features/apiaries/screens/apiary-layout-editor-screen';

export default function ApiaryLayoutEditorRoute() {
  const { apiaryId } = useLocalSearchParams<{ apiaryId: string }>();

  return <ApiaryLayoutEditorScreen apiaryId={apiaryId} />;
}
