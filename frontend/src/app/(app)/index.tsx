import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useAuth,
} from '@/features/auth/hooks/use-auth';

export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Pčelarski eDnevnik
      </Text>

      <Text style={styles.subtitle}>
        Korisnik je prijavljen.
      </Text>

      <Pressable
        onPress={() => {
          void signOut();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Odjavi se
        </Text>
      </Pressable>
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

  subtitle: {
    marginTop: 8,
  },

  button: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  buttonText: {
    fontWeight: '600',
  },
});