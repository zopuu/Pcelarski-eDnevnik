import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />

      <Text style={styles.text}>
        Završavanje prijave...
      </Text>
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