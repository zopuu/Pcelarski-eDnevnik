import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { apiClient } from '@/shared/api/api-client';

interface ApiStatusResponse {
  name: string;
  status: string;
}

export default function IndexScreen() {
  const apiStatus = useQuery({
    queryKey: ['api-status'],
    queryFn: () =>
      apiClient.get<ApiStatusResponse>('/'),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Pčelarski eDnevnik
      </Text>

      {apiStatus.isPending && (
        <ActivityIndicator
          style={styles.status}
        />
      )}

      {apiStatus.isError && (
        <Text style={styles.error}>
          API nije dostupan:{' '}
          {apiStatus.error.message}
        </Text>
      )}

      {apiStatus.data && (
        <View style={styles.status}>
          <Text>
            API: {apiStatus.data.name}
          </Text>

          <Text>
            Status: {apiStatus.data.status}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  status: {
    marginTop: 16,
  },

  error: {
    marginTop: 16,
    maxWidth: 500,
  },
});