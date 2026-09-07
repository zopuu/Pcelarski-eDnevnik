import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useState,
} from 'react';

import type {
  ApiaryStatus,
  ApiaryType,
} from '../types/apiary';

import {
  colors,
} from '@/shared/theme/colors';

type ApiaryListFiltersProps = {
  nameSearch: string;
  onNameSearchChange: (value: string) => void;
  selectedStatus: ApiaryStatus | null;
  onStatusChange: (value: ApiaryStatus | null) => void;
  selectedType: ApiaryType | null;
  onTypeChange: (value: ApiaryType | null) => void;
};

const statusOptions: FilterOption[] = [
  { value: 'active', label: 'Aktivan' },
  { value: 'inactive', label: 'Neaktivan' },
];

const typeOptions: FilterOption[] = [
  { value: 'stationary', label: 'Stacionaran' },
  { value: 'migratory', label: 'Seleći' },
];

export function ApiaryListFilters({
  nameSearch,
  onNameSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
}: ApiaryListFiltersProps) {
  return (
    <View className="mb-5">
      <TextInput
        value={nameSearch}
        onChangeText={onNameSearchChange}
        placeholder="Pretraži po nazivu"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Pretraži pčelinjake po nazivu"
        className="h-12 rounded-2xl border border-border bg-surface px-4 text-base text-foreground"
      />

      <View className="mt-2 flex-row gap-2">
        <CompactFilter
          label="Status"
          selectedValue={selectedStatus ?? 'all'}
          options={[
            { value: 'all', label: 'Status' },
            ...statusOptions,
          ]}
          onSelect={(value) => {
            onStatusChange(
              value === 'all'
                ? null
                : value as ApiaryStatus,
            );
          }}
        />

        <CompactFilter
          label="Tip"
          selectedValue={selectedType ?? 'all'}
          options={[
            { value: 'all', label: 'Tip' },
            ...typeOptions,
          ]}
          onSelect={(value) => {
            onTypeChange(
              value === 'all'
                ? null
                : value as ApiaryType,
            );
          }}
        />
      </View>
    </View>
  );
}

type FilterOption = {
  value: string;
  label: string;
};

function CompactFilter({
  label,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filter: ${label}`}
        onPress={() => {
          setIsOpen(true);
        }}
        className="h-11 flex-1 flex-row items-center justify-center gap-1 rounded-2xl border border-border bg-surface px-2"
      >
        <Text
          numberOfLines={1}
          className="text-sm font-semibold text-foreground"
        >
          {selectedOption?.label ?? label}
        </Text>
        <Text className="text-xs text-muted">⌄</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsOpen(false);
        }}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => {
            setIsOpen(false);
          }}
        >
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
            }}
            className="rounded-t-3xl bg-background px-5 pb-8 pt-5"
          >
            <Text className="mb-4 text-xl font-bold text-foreground">
              {label}
            </Text>

            {options.map((option) => {
              const selected = option.value === selectedValue;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`mb-2 min-h-12 flex-row items-center rounded-2xl px-4 ${
                    selected ? 'bg-primary/10' : 'bg-surface'
                  }`}
                >
                  <Text className="flex-1 text-base font-semibold text-foreground">
                    {option.label}
                  </Text>
                  {selected && (
                    <Text className="text-lg font-bold text-primary">
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
