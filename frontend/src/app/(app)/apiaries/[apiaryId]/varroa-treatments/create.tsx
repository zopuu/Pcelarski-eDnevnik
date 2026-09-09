import { useLocalSearchParams } from 'expo-router';

import { RecordVarroaTreatmentScreen } from '@/features/varroa-treatments/screens/record-varroa-treatment-screen';

export default function RecordApiaryVarroaTreatmentRoute() {
  const { apiaryId } = useLocalSearchParams<{ apiaryId: string }>();

  return <RecordVarroaTreatmentScreen apiaryId={apiaryId} />;
}
