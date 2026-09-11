import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';

export function HarvestLoadingState({ label = 'Učitavanje...' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-center text-muted">{label}</Text>
    </View>
  );
}

export function HarvestErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5">
        <Text className="font-bold text-background">Pokušaj ponovo</Text>
      </Pressable>
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-3 mt-8 text-lg font-bold text-foreground">{children}</Text>;
}

export function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[46%] flex-1 rounded-2xl bg-background px-4 py-3">
      <Text className="text-xs font-semibold text-muted">{label}</Text>
      <Text className="mt-1 text-base font-bold text-foreground">{value}</Text>
    </View>
  );
}
