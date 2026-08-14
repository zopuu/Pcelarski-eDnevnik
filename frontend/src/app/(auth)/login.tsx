import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/features/auth/hooks/use-auth';

export default function LoginScreen() {
  const {
    signIn,
    isSigningIn,
    error,
  } = useAuth();

  const { registered } =
    useLocalSearchParams<{
      registered?: string;
    }>();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.brand}>
          <Text style={styles.logo}>
            Pčelarski eDnevnik
          </Text>

          <Text style={styles.description}>
            Digitalna evidencija vaših
            pčelinjaka, košnica i pčelinjih
            društava.
          </Text>
        </View>

        {registered === '1' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Nalog je uspešno kreiran.
              Možete da se prijavite.
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <Pressable
          disabled={isSigningIn}
          onPress={() => {
            void signIn();
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed &&
              styles.primaryButtonPressed,
            isSigningIn &&
              styles.buttonDisabled,
          ]}
        >
          {isSigningIn ? (
            <ActivityIndicator
              color="#ffffff"
            />
          ) : (
            <Text
              style={styles.primaryButtonText}
            >
              Prijavi se
            </Text>
          )}
        </Pressable>

        <View style={styles.registration}>
          <Text style={styles.registrationText}>
            Nemate nalog?
          </Text>

          <Pressable
            onPress={() => {
              router.push('/register');
            }}
          >
            <Text style={styles.registrationLink}>
              Registrujte se
            </Text>
          </Pressable>
        </View>

        <Text style={styles.securityText}>
          Prijavljivanje se obavlja preko
          bezbednog OpenID Connect sistema.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f6f3',
  },

  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },

  brand: {
    marginBottom: 28,
  },

  logo: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#222222',
  },

  primaryButtonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  registration: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    gap: 5,
  },

  registrationText: {
    fontSize: 15,
  },

  registrationLink: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  successBox: {
    marginBottom: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eef6ee',
  },

  successText: {
    fontSize: 14,
  },

  errorBox: {
    marginBottom: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fbeaea',
  },

  errorText: {
    fontSize: 14,
  },

  securityText: {
    marginTop: 24,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.65,
  },
});