import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/features/auth/hooks/use-auth';

export default function HomeScreen() {
  const {
    signOut,
  } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>
            Pčelarski eDnevnik
          </Text>

          <Text style={styles.subtitle}>
            Početna
          </Text>
        </View>

        <Pressable
          onPress={() => {
            void signOut();
          }}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed &&
              styles.logoutButtonPressed,
          ]}
        >
          <Text style={styles.logoutText}>
            Odjavi se
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcome}>
          Dobro došli
        </Text>

        <Text style={styles.description}>
          Uspešno ste prijavljeni u
          Pčelarski eDnevnik.
        </Text>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>
            Pčelinjaci
          </Text>

          <Text style={styles.placeholderText}>
            Ovde ćemo sledeće dodati pregled
            i upravljanje pčelinjacima.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f3',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
  },

  appName: {
    fontSize: 20,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    opacity: 0.6,
  },

  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  logoutButtonPressed: {
    opacity: 0.6,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },

  content: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    padding: 24,
  },

  welcome: {
    marginTop: 32,
    fontSize: 30,
    fontWeight: '700',
  },

  description: {
    marginTop: 6,
    fontSize: 16,
    opacity: 0.7,
  },

  placeholder: {
    marginTop: 32,
    padding: 24,
    borderRadius: 14,
    backgroundColor: '#ffffff',
  },

  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  placeholderText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
});