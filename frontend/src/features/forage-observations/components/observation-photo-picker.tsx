import Ionicons
  from '@react-native-vector-icons/ionicons';
import {
  Image,
} from 'expo-image';
import * as ImagePicker
  from 'expo-image-picker';
import {
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  colors,
} from '@/shared/theme/colors';
import {
  environment,
} from '@/shared/config/environment';
import type {
  ImageUpload,
} from '@/shared/api/image-upload';

export type ObservationPhotoDraft = ImageUpload & {
  width: number;
  height: number;
};

type ObservationPhotoPickerProps = {
  value: ObservationPhotoDraft | null;
  imageUrl?: string | null;
  onChange: (
    photo: ObservationPhotoDraft | null,
  ) => void;
};

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 1,
};

const maximumImageSizeBytes = 5 * 1024 * 1024;
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export function ObservationPhotoPicker({
  value,
  imageUrl,
  onChange,
}: ObservationPhotoPickerProps) {
  const [isPicking, setIsPicking] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const previewUri = value?.uri ??
    (imageUrl ? `${environment.apiUrl}${imageUrl}` : null);

  const selectPhoto = async (
    source: 'camera' | 'library',
  ) => {
    setError(null);
    setIsPicking(true);

    try {
      const permission =
        source === 'camera'
          ? await ImagePicker
            .requestCameraPermissionsAsync()
          : await ImagePicker
            .requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          source === 'camera'
            ? 'Dozvolite pristup kameri da biste snimili fotografiju.'
            : 'Dozvolite pristup galeriji da biste izabrali fotografiju.',
        );
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(
            imagePickerOptions,
          )
          : await ImagePicker.launchImageLibraryAsync(
            imagePickerOptions,
          );

      if (
        result.canceled ||
        !result.assets[0]
      ) {
        return;
      }

      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > maximumImageSizeBytes) {
        setError('Fotografija može imati najviše 5 MB.');
        return;
      }

      if (!allowedMimeTypes.includes(
        asset.mimeType as typeof allowedMimeTypes[number],
      )) {
        setError('Izaberite JPEG, PNG ili WebP fotografiju.');
        return;
      }

      const mimeType = asset.mimeType as ImageUpload['mimeType'];
      const extension = mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';

      onChange({
        uri: asset.uri,
        fileName: asset.fileName ?? `forage-observation.${extension}`,
        mimeType,
        width: asset.width,
        height: asset.height,
      });
    } catch {
      setError(
        'Fotografiju nije moguće otvoriti. Pokušajte ponovo.',
      );
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        Fotografija
      </Text>
      <Text className="mb-3 text-sm text-muted">
        Možete dodati jednu fotografiju zapažanja.
      </Text>

      {previewUri ? (
        <View className="overflow-hidden rounded-3xl border border-border bg-surface">
          <Image
            source={previewUri}
            contentFit="cover"
            style={{
              width: '100%',
              height: 224,
            }}
          />
          <View className="flex-row items-center justify-between gap-4 px-4 py-3">
            <Text className="flex-1 text-sm text-muted">
              {value
                ? 'Fotografija će biti poslata uz čuvanje zapažanja.'
                : 'Fotografija je sačuvana uz zapažanje.'}
            </Text>
            {value && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ukloni novu fotografiju"
                onPress={() => onChange(null)}
                className="min-h-11 min-w-11 items-center justify-center rounded-full bg-error/10"
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.error}
                />
              </Pressable>
            )}
          </View>
          <View className="flex-row gap-3 px-4 pb-4">
            <PhotoAction
              label="Kamera"
              icon="camera-outline"
              disabled={isPicking}
              onPress={() => {
                void selectPhoto('camera');
              }}
            />
            <PhotoAction
              label="Zameni"
              icon="images-outline"
              disabled={isPicking}
              onPress={() => {
                void selectPhoto('library');
              }}
            />
          </View>
        </View>
      ) : (
        <View className="flex-row gap-3">
          <PhotoAction
            label="Kamera"
            icon="camera-outline"
            disabled={isPicking}
            onPress={() => {
              void selectPhoto('camera');
            }}
          />
          <PhotoAction
            label="Galerija"
            icon="images-outline"
            disabled={isPicking}
            onPress={() => {
              void selectPhoto('library');
            }}
          />
        </View>
      )}

      {isPicking && (
        <View className="mt-3 flex-row items-center gap-2">
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />
          <Text className="text-sm text-muted">
            Otvaranje fotografija...
          </Text>
        </View>
      )}

      {error && (
        <Text className="mt-2 text-sm text-error">
          {error}
        </Text>
      )}
      <Text className="mt-2 text-sm text-muted">
        JPEG, PNG ili WebP, najviše 5 MB.
      </Text>
    </View>
  );
}

function PhotoAction({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: 'camera-outline' | 'images-outline';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Dodaj fotografiju: ${label}`}
      disabled={disabled}
      onPress={onPress}
      className="min-h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4"
      style={({ pressed }) => ({
        opacity: disabled
          ? 0.5
          : pressed
            ? 0.7
            : 1,
      })}
    >
      <Ionicons
        name={icon}
        size={21}
        color={colors.primary}
      />
      <Text className="font-semibold text-foreground">
        {label}
      </Text>
    </Pressable>
  );
}
