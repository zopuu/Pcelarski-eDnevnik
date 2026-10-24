import { useState } from 'react';

import { Pressable, Text, TextInput, View } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import { colors } from '@/shared/theme/colors';

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

export function InspectionSection({
  title,
  description,
  children,
  defaultOpen = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-border bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((current) => !current)}
        className="min-h-16 flex-row items-center px-5 py-4"
      >
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-foreground">{title}</Text>
          {description && <Text className="mt-1 text-xs leading-4 text-muted">{description}</Text>}
        </View>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={21} color={colors.muted} />
      </Pressable>

      {isOpen && <View className="border-t border-border px-5 pb-1 pt-5">{children}</View>}
    </View>
  );
}

export function RatingField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
}) {
  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-sm font-semibold text-foreground">{label}</Text>
        <Text className="ml-3 text-xs text-muted">{value ? `${value}/5` : 'Nije uneto'}</Text>
      </View>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const selected = value === rating;

          return (
            <Pressable
              key={rating}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ocena ${rating}`}
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? null : rating)}
              className={`min-h-12 flex-1 items-center justify-center rounded-xl border ${
                selected ? 'border-primary bg-primary' : 'border-border bg-background'
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  selected ? 'text-background' : 'text-foreground'
                }`}
              >
                {rating}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

export function CountField({
  label,
  value,
  onChange,
  error,
  maximum = 32767,
  suffix,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  maximum?: number;
  suffix?: string;
}) {
  const decrement = () => {
    if (value === null) {
      return;
    }

    onChange(Math.max(0, value - 1));
  };

  const increment = () => {
    onChange(Math.min(maximum, (value ?? 0) + 1));
  };

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Smanji: ${label}`}
          disabled={value === null}
          onPress={decrement}
          className={`h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background ${
            value === null ? 'opacity-40' : ''
          }`}
        >
          <Ionicons name="remove" size={24} color={colors.foreground} />
        </Pressable>

        <View className="h-14 flex-1 flex-row items-center rounded-2xl border border-border bg-background px-3">
          <TextInput
            accessibilityLabel={label}
            value={value === null ? '' : String(value)}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '');
              onChange(digits ? Number(digits) : null);
            }}
            keyboardType="number-pad"
            inputMode="numeric"
            placeholder="—"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            className="flex-1 text-center text-lg font-bold text-foreground"
          />
          {suffix && <Text className="ml-1 text-sm font-semibold text-muted">{suffix}</Text>}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Povećaj: ${label}`}
          disabled={value !== null && value >= maximum}
          onPress={increment}
          className={`h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background ${
            value !== null && value >= maximum ? 'opacity-40' : ''
          }`}
        >
          <Ionicons name="add" size={24} color={colors.foreground} />
        </Pressable>
      </View>
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

export function BooleanField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <View className="flex-row gap-2">
        {[
          { value: true, label: 'Da' },
          { value: false, label: 'Ne' },
        ].map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? null : option.value)}
              className={`min-h-12 flex-1 items-center justify-center rounded-2xl border ${
                selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
              }`}
            >
              <Text className={`font-bold ${selected ? 'text-primary' : 'text-foreground'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function EnumChoiceField<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly ChoiceOption<T>[];
  error?: string;
}) {
  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-sm font-semibold text-foreground">{label}</Text>
        {value && (
          <Pressable
            accessibilityRole="button"
            onPress={() => onChange(null)}
            className="ml-2 px-2 py-1"
          >
            <Text className="text-xs font-semibold text-primary">Obriši</Text>
          </Pressable>
        )}
      </View>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? null : option.value)}
              className={`min-h-11 justify-center rounded-2xl border px-3 py-2 ${
                selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

export function FormTextInput({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`rounded-2xl border bg-background px-4 text-base text-foreground ${
          multiline ? 'min-h-28 py-4' : 'h-14'
        } ${error ? 'border-error' : 'border-border'}`}
      />
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}
