import { Redirect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/use-auth';

WebBrowser.maybeCompleteAuthSession();

export default function LogoutCallbackScreen() {
  const { status, isAuthenticated } = useAuth();

  if (status === 'unauthenticated' || !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />

      <Text style={styles.text}>Završavanje odjave...</Text>
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

  text: {
    marginTop: 12,
  },
});
