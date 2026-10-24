import type { ReactNode } from 'react';
import { View } from 'react-native';

type TimelineItemProps = {
  date: ReactNode;
  children: ReactNode;
  isFirst: boolean;
  isLast: boolean;
  muted?: boolean;
};

export function TimelineItem({
  date,
  children,
  isFirst,
  isLast,
  muted = false,
}: TimelineItemProps) {
  return (
    <View className="flex-row">
      <View className="mb-5 w-16 items-start justify-center pr-2">{date}</View>
      <View className="relative w-7 items-center">
        {!isFirst && (
          <View className="absolute top-0 w-px bg-border" style={{ bottom: '50%' }} />
        )}
        {!isLast && (
          <View className="absolute bottom-0 w-px bg-border" style={{ top: '50%' }} />
        )}
        <View className="mb-5 flex-1 items-center justify-center">
          <View
            className={`z-10 h-4 w-4 rounded-full border-4 border-background ${muted ? 'bg-muted' : 'bg-primary'}`}
          />
        </View>
      </View>
      {children}
    </View>
  );
}
