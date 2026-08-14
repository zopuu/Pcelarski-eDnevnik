import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';

export function configureOnlineManager(): () => void {
  let initialized = false;

  const subscription = Network.addNetworkStateListener((state) => {
    initialized = true;
    onlineManager.setOnline(Boolean(state.isConnected));
  });

  void Network.getNetworkStateAsync()
    .then((state) => {
      if (!initialized) {
        onlineManager.setOnline(Boolean(state.isConnected));
      }
    })
    .catch(() => {
      // Network state will be updated by the listener
      // when it becomes available.
    });

  return () => {
    subscription.remove();
  };
}