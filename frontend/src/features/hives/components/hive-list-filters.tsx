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
  HiveStatus,
  HiveType,
} from '../types/hive';

import {
  colors,
} from '@/shared/theme/colors';

type HiveListFiltersProps = {
  labelSearch: string;
  onLabelSearchChange: (value: string) => void;
  selectedStatus: HiveStatus | null;
  onStatusChange: (value: HiveStatus | null) => void;
  selectedType: HiveType | null;
  onTypeChange: (value: HiveType | null) => void;
  selectedColor: string | null | undefined;
  onColorChange: (value: string | null | undefined) => void;
  availableColors: string[];
  hasColorlessHives: boolean;
};

const statusOptions: { value: HiveStatus; label: string }[] = [
  { value: 'active', label: 'Aktivna' },
  { value: 'inactive', label: 'Neaktivna' },
  { value: 'underRepair', label: 'Na popravci' },
  { value: 'writtenOff', label: 'Rashodovana' },
];

const typeOptions: { value: HiveType; label: string }[] = [
  { value: 'dadantBlatt', label: 'DB' },
  { value: 'langstrothRoot', label: 'LR' },
  { value: 'albertiZnidersic', label: 'AŽ' },
  { value: 'farrar', label: 'Farar' },
  { value: 'nucleus', label: 'Nukleus' },
  { value: 'other', label: 'Ostalo' },
];

export function HiveListFilters({
  labelSearch,
  onLabelSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedColor,
  onColorChange,
  availableColors,
  hasColorlessHives,
}: HiveListFiltersProps) {
  const statusFilterOptions: FilterOption[] = [
    { value: 'all', label: 'Status' },
    ...statusOptions,
  ];
  const typeFilterOptions: FilterOption[] = [
    { value: 'all', label: 'Tip' },
    ...typeOptions,
  ];
  const colorFilterOptions: FilterOption[] = [
    { value: 'all', label: 'Boja' },
    ...(hasColorlessHives
      ? [{ value: 'none', label: 'Bez boje' }]
      : []),
    ...availableColors.map((color) => ({
      value: color,
      label: 'Boja',
      colorHex: color,
    })),
  ];

  return (
    <View className="mb-5">
      <TextInput
        value={labelSearch}
        onChangeText={onLabelSearchChange}
        placeholder="Pretraži po oznaci"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Pretraži košnice po oznaci"
        autoCapitalize="none"
        className="h-12 rounded-2xl border border-border bg-surface px-4 text-base text-foreground"
      />

      <View className="mt-2 flex-row gap-2">
        <CompactFilter
          label="Status"
          selectedValue={selectedStatus ?? 'all'}
          options={statusFilterOptions}
          onSelect={(value) => {
            onStatusChange(
              value === 'all'
                ? null
                : value as HiveStatus,
            );
          }}
        />

        <CompactFilter
          label="Tip"
          selectedValue={selectedType ?? 'all'}
          options={typeFilterOptions}
          onSelect={(value) => {
            onTypeChange(
              value === 'all'
                ? null
                : value as HiveType,
            );
          }}
        />

        <CompactFilter
          label="Boja"
          selectedValue={
            selectedColor === undefined
              ? 'all'
              : selectedColor === null
                ? 'none'
                : selectedColor
          }
          options={colorFilterOptions}
          onSelect={(value) => {
            onColorChange(
              value === 'all'
                ? undefined
                : value === 'none'
                  ? null
                  : value,
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
  colorHex?: string;
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
  const selectedColor = selectedOption?.colorHex;
  const selectedTextColor = selectedColor
    ? getTextColor(selectedColor)
    : undefined;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filter: ${label}`}
        onPress={() => {
          setIsOpen(true);
        }}
        className="h-11 flex-1 flex-row items-center justify-center gap-1 rounded-2xl border border-border bg-surface px-2"
        style={selectedColor
          ? { backgroundColor: selectedColor }
          : undefined}
      >
        <Text
          numberOfLines={1}
          className="text-sm font-semibold text-foreground"
          style={selectedTextColor
            ? { color: selectedTextColor }
            : undefined}
        >
          {selectedOption?.label ?? label}
        </Text>

        <Text
          className="text-xs text-muted"
          style={selectedTextColor
            ? { color: selectedTextColor }
            : undefined}
        >
          ⌄
        </Text>
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
                  accessibilityLabel={option.colorHex
                    ? `Filtriraj po boji ${option.colorHex}`
                    : option.label}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`mb-2 min-h-12 flex-row items-center rounded-2xl px-4 ${
                    selected ? 'bg-primary/10' : 'bg-surface'
                  }`}
                  style={option.colorHex
                    ? { backgroundColor: option.colorHex }
                    : undefined}
                >
                  {!option.colorHex && (
                    <Text className="flex-1 text-base font-semibold text-foreground">
                      {option.label}
                    </Text>
                  )}

                  {option.colorHex && <View className="flex-1" />}

                  {selected && (
                    <Text
                      className="text-lg font-bold text-primary"
                      style={option.colorHex
                        ? { color: getTextColor(option.colorHex) }
                        : undefined}
                    >
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

function getTextColor(colorHex: string) {
  const red = Number.parseInt(colorHex.slice(1, 3), 16);
  const green = Number.parseInt(colorHex.slice(3, 5), 16);
  const blue = Number.parseInt(colorHex.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? '#1F2937' : '#FFFFFF';
}
