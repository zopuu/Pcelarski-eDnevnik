import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useAuth,
} from '@/features/auth/hooks/use-auth';

export default function LoginScreen() {
  const {
    signIn,
    isSigningIn,
    error,
  } = useAuth();

  const {registered} = useLocalSearchParams<{
    registered?: string;
  }>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Pčelarski eDnevnik
        </Text>

        <Text style={styles.subtitle}>
          Prijavite se da biste nastavili.
        </Text>
        {registered === '1' && (
        <Text style={styles.success}>
            Nalog je uspešno kreiran. Sada se prijavite.
        </Text>
        )}

        <Pressable
          disabled={isSigningIn}
          onPress={() => {
            void signIn();
          }}
          style={({ pressed }) => [
            styles.button,
            pressed &&
              styles.buttonPressed,
            isSigningIn &&
              styles.buttonDisabled,
          ]}
        >
          {isSigningIn ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>
              Prijavi se
            </Text>
          )}
        </Pressable>

        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}
        <Pressable
            onPress={() =>
                router.push('//register')
            }
            style={styles.registerButton}
            >
            <Text style={styles.registerButtonText}>
                Nemate nalog? Registrujte se
            </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
  },

  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#222',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  error: {
    marginTop: 16,
  },
  success: {
    marginTop: 16,
    color: '#00ff00',
  },
  registerButton: {
  alignItems: 'center',
  padding: 16,
},

registerButtonText: {
  fontSize: 15,
  fontWeight: '500',
},
});