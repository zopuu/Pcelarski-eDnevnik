import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';

export function configureOnlineManager(): () => void {
  const updateOnlineStatus = (
    state: Network.NetworkState,
  ) => {
    /*
     * Expo can report an UNKNOWN state while Android is
     * establishing a connection. Treating that transient state
     * as offline pauses every React Query request before it starts.
     * Only NONE is a definitive offline signal.
     */
    onlineManager.setOnline(
      state.type !==
        Network.NetworkStateType.NONE,
    );
  };

  const subscription =
    Network.addNetworkStateListener(
      updateOnlineStatus,
    );

  void Network.getNetworkStateAsync()
    .then(updateOnlineStatus)
    .catch(() => {
      // Keep TanStack Query's optimistic online default.
      // The subscription will update it when available.
    });

  return () => {
    subscription.remove();
  };
}
