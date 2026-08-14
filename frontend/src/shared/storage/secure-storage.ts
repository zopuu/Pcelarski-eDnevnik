import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const webMemoryStorage =
  new Map<string, string>();

export async function getSecureItem(
  key: string,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webMemoryStorage.get(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(
  key: string,
  value: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    webMemoryStorage.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(
    key,
    value,
  );
}

export async function deleteSecureItem(
  key: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    webMemoryStorage.delete(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}