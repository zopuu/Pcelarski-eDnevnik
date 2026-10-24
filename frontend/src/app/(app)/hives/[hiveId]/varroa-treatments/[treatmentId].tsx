import { useLocalSearchParams } from 'expo-router';

import { VarroaTreatmentDetailsScreen } from '@/features/varroa-treatments/screens/varroa-treatment-details-screen';

export default function VarroaTreatmentDetailsRoute() {
  const { hiveId, treatmentId } = useLocalSearchParams<{
    hiveId: string;
    treatmentId: string;
  }>();

  return <VarroaTreatmentDetailsScreen hiveId={hiveId} treatmentId={treatmentId} />;
}
