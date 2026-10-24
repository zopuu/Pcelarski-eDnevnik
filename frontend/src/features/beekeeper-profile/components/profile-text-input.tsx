import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

import { colors } from '@/shared/theme/colors';

type ProfileTextInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  accessibilityLabel?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
};

export function ProfileTextInput({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  accessibilityLabel,
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  autoComplete,
  keyboardType = 'default',
}: ProfileTextInputProps) {
  return (
    <View className="mb-4">
      <Text
        className="
          mb-2
          text-sm
          font-semibold
          text-foreground
        "
      >
        {label}
      </Text>

      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        className={`
          ${multiline ? 'min-h-24 py-3' : 'h-14'}
          rounded-2xl
          border
          bg-surface
          px-4
          text-base
          text-foreground
          ${error ? 'border-error' : 'border-border'}
        `}
      />

      {error && (
        <Text
          className="
            mt-1
            text-sm
            text-error
          "
        >
          {error}
        </Text>
      )}
    </View>
  );
}
