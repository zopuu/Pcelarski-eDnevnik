import type {
  ComponentProps,
} from 'react';

import Ionicons
  from '@react-native-vector-icons/ionicons';

export type ContextualActionIconName =
  ComponentProps<typeof Ionicons>['name'];

export type ContextualActionVariant =
  | 'default'
  | 'danger';

export type ContextualAction = {
  key: string;

  label: string;

  icon: ContextualActionIconName;

  onPress: () => void;

  accessibilityLabel?: string;

  variant?: ContextualActionVariant;

  disabled?: boolean;

  hidden?: boolean;

  loading?: boolean;
};