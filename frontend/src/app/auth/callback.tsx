import { Redirect } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/use-auth';

export default function AuthCallbackScreen() {
  const { status, isAuthenticated, error, signIn } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Prijavljivanje nije uspelo</Text>

        <Text style={styles.errorText}>{error}</Text>

        <Pressable
          onPress={() => {
            void signIn();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Pokušaj ponovo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />

      <Text style={styles.text}>Završavanje prijave...</Text>

      {status === 'unauthenticated' && (
        <Text style={styles.secondaryText}>Obrada odgovora servera...</Text>
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

  text: {
    marginTop: 12,
    fontSize: 16,
  },

  secondaryText: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.6,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },

  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  buttonText: {
    fontWeight: '600',
  },
});
