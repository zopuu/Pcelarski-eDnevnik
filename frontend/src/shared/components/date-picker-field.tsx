import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/theme/colors';
import {
  formatDateOnly,
  formatDateOnlyForDisplay,
  isDateOnly,
  parseDateOnly,
} from '@/shared/utils/date-only';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
  maximumDate?: string;
  error?: string;
  required?: boolean;
};

function toDate(value: string | undefined) {
  return value && isDateOnly(value) ? parseDateOnly(value) : undefined;
}

export function DatePickerField(props: DatePickerFieldProps) {
  if (Platform.OS === 'web') {
    return <WebDatePickerField {...props} />;
  }

  return <NativeDatePickerField {...props} />;
}

function NativeDatePickerField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
  required = false,
}: DatePickerFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const minimum = toDate(minimumDate);
  const maximum = toDate(maximumDate);
  const pickerValue = toDate(value) ?? minimum ?? maximum ?? new Date();

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>

      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Izaberite ${label.toLowerCase()}`}
          onPress={() => {
            setIsPickerVisible(true);
          }}
          className={`min-h-14 flex-1 justify-center rounded-2xl border bg-surface px-4 ${error ? 'border-error' : 'border-border'}`}
        >
          <Text className={`text-base ${value ? 'text-foreground' : 'text-muted'}`}>
            {value ? formatDateOnlyForDisplay(value) : 'Izaberite datum'}
          </Text>
        </Pressable>

        {!required && value && (
          <ClearDateButton label={label} onPress={() => {
            onChange('');
            setIsPickerVisible(false);
          }} />
        )}
      </View>

      {isPickerVisible && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          minimumDate={minimum}
          maximumDate={maximum}
          accentColor={colors.primary}
          presentation="dialog"
          onDismiss={() => {
            setIsPickerVisible(false);
          }}
          onValueChange={(_event, date) => {
            onChange(formatDateOnly(date));
            setIsPickerVisible(false);
          }}
        />
      )}

      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

function WebDatePickerField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
  required = false,
}: DatePickerFieldProps) {
  const inputId =
    `date-${label
      .toLocaleLowerCase('sr-Latn-RS')
      .replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div
      style={{
        marginBottom: 16,
      }}
    >
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          marginBottom: 8,
          color: colors.foreground,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          id={inputId}
          aria-label={`Izaberite ${label.toLowerCase()}`}
          type="date"
          value={value}
          min={minimumDate}
          max={maximumDate}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          style={{
            minHeight: 56,
            flex: 1,
            borderRadius: 16,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.surface,
            paddingLeft: 16,
            paddingRight: 16,
            color: colors.foreground,
            fontSize: 16,
          }}
        />

        {!required && value && (
          <button
            type="button"
            aria-label={`Obriši ${label.toLowerCase()}`}
            onClick={() => {
              onChange('');
            }}
            style={{
              minHeight: 56,
              borderRadius: 16,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingLeft: 16,
              paddingRight: 16,
              color: colors.muted,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Obriši
          </button>
        )}
      </div>

      <p
        style={{
          marginBottom: 0,
          marginTop: 4,
          color: error
            ? colors.error
            : colors.muted,
          fontSize: 14,
        }}
      >
        {error ??
          (value
            ? formatDateOnlyForDisplay(value)
            : 'Izaberite datum')}
      </p>
    </div>
  );
}

function ClearDateButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Obriši ${label.toLowerCase()}`}
      onPress={onPress}
      className="min-h-14 items-center justify-center rounded-2xl border border-border bg-surface px-4"
    >
      <Text className="font-semibold text-muted">Obriši</Text>
    </Pressable>
  );
}
