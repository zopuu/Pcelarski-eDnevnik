import Ionicons from '@react-native-vector-icons/ionicons';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFieldArrayReturn,
  useWatch,
} from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import type { HoneyBatchCompositionFormInput } from '../schemas/honey-batch-composition.schema';

const emptyItem = { forageType: '', percentage: '', notes: '' };

type CompositionEditorProps = {
  control: Control<HoneyBatchCompositionFormInput>;
  fields: UseFieldArrayReturn<HoneyBatchCompositionFormInput, 'items'>['fields'];
  append: UseFieldArrayAppend<HoneyBatchCompositionFormInput, 'items'>;
  remove: UseFieldArrayRemove;
  errors: FieldErrors<HoneyBatchCompositionFormInput>;
};

export function CompositionEditor({
  control,
  fields,
  append,
  remove,
  errors,
}: CompositionEditorProps) {
  const items = useWatch({ control, name: 'items' }) ?? [];
  const total = items.reduce((sum, item) => {
    const percentage = Number(item.percentage);
    return Number.isInteger(percentage) ? sum + percentage : sum;
  }, 0);
  const totalMessage =
    total < 100
      ? `Potrebno je još ${100 - total}%.`
      : total === 100
        ? 'Ukupno: 100%'
        : 'Ukupan procenat ne može biti veći od 100%.';

  return (
    <View>
      <View className="mb-3 flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Stavke sastava</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">
            Navedite vrste paše i njihov udeo u sastavu meda.
          </Text>
        </View>
        <View
          className={`rounded-full px-3 py-1.5 ${total > 100 ? 'bg-error/10' : 'bg-primary/10'}`}
        >
          <Text className={`text-xs font-bold ${total > 100 ? 'text-error' : 'text-primary'}`}>
            Ukupno: {total}%
          </Text>
        </View>
      </View>

      {fields.length === 0 ? (
        <View className="rounded-3xl border border-dashed border-border bg-surface px-5 py-6">
          <Text className="text-center text-sm text-muted">Još nema stavki sastava.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {fields.map((field, index) => (
            <View key={field.id} className="rounded-3xl border border-border bg-surface p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-bold text-foreground">Stavka {index + 1}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ukloni stavku ${index + 1}`}
                  onPress={() => remove(index)}
                  className="min-h-11 min-w-11 items-center justify-center rounded-full bg-error/10"
                >
                  <Ionicons name="trash-outline" size={19} color={colors.error} />
                </Pressable>
              </View>
              <Controller
                control={control}
                name={`items.${index}.forageType`}
                render={({ field: formField }) => (
                  <EditorInput
                    label="Vrsta paše / naziv *"
                    value={formField.value}
                    onChangeText={formField.onChange}
                    placeholder="npr. Bagrem"
                    error={errors.items?.[index]?.forageType?.message}
                    maxLength={100}
                  />
                )}
              />
              <Controller
                control={control}
                name={`items.${index}.percentage`}
                render={({ field: formField }) => (
                  <EditorInput
                    label="Procenat *"
                    value={formField.value}
                    onChangeText={(value) => formField.onChange(value.replace(/[^0-9]/g, ''))}
                    placeholder="npr. 70"
                    keyboardType="number-pad"
                    error={errors.items?.[index]?.percentage?.message}
                    maxLength={3}
                  />
                )}
              />
              <Controller
                control={control}
                name={`items.${index}.notes`}
                render={({ field: formField }) => (
                  <EditorInput
                    label="Napomena"
                    value={formField.value}
                    onChangeText={formField.onChange}
                    placeholder="Opcionalno"
                    error={errors.items?.[index]?.notes?.message}
                    multiline
                    maxLength={1000}
                  />
                )}
              />
            </View>
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => append(emptyItem)}
        className="mt-3 min-h-12 items-center justify-center rounded-2xl border border-primary bg-surface px-4"
      >
        <Text className="font-bold text-primary">+ Dodaj stavku</Text>
      </Pressable>
      <Text
        className={`mt-3 text-sm font-semibold ${total > 100 ? 'text-error' : total === 100 ? 'text-success' : 'text-muted'}`}
      >
        {totalMessage}
      </Text>
      {errors.items?.message && (
        <Text className="mt-2 text-sm text-error">{errors.items.message}</Text>
      )}
    </View>
  );
}

function EditorInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  multiline = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  multiline?: boolean;
  error?: string;
}) {
  return (
    <View className="mb-3">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`${multiline ? 'min-h-24 py-3' : 'h-14'} rounded-2xl border bg-background px-4 text-base text-foreground ${error ? 'border-error' : 'border-border'}`}
      />
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}
