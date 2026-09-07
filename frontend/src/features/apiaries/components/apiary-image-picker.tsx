import Ionicons from '@react-native-vector-icons/ionicons';
import {
  Image,
} from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import type {
  ApiaryImageUpload,
} from '@/features/apiaries/types/apiary-image';
import {
  environment,
} from '@/shared/config/environment';
import {
  colors,
} from '@/shared/theme/colors';

type ApiaryImagePickerProps = {
  value: ApiaryImageUpload | null;
  imageUrl?: string | null;
  onChange: (image: ApiaryImageUpload | null) => void;
};

const maximumImageSizeBytes = 5 * 1024 * 1024;
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export function ApiaryImagePicker({
  value,
  imageUrl,
  onChange,
}: ApiaryImagePickerProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUri = value?.uri ??
    (imageUrl ? `${environment.apiUrl}${imageUrl}` : null);

  const chooseImage = async () => {
    setError(null);
    setIsPicking(true);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError('Dozvolite pristup galeriji da biste izabrali fotografiju.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
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

      const mimeType = asset.mimeType as ApiaryImageUpload['mimeType'];
      const extension = mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';

      onChange({
        uri: asset.uri,
        fileName: asset.fileName ?? `apiary.${extension}`,
        mimeType,
      });
    } catch {
      setError('Fotografiju nije moguće otvoriti. Pokušajte ponovo.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        Fotografija pčelinjaka
      </Text>

      {previewUri && (
        <Image
          source={previewUri}
          contentFit="cover"
          style={{
            width: '100%',
            height: 200,
            borderRadius: 20,
          }}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Izaberi fotografiju pčelinjaka"
        disabled={isPicking}
        onPress={() => {
          void chooseImage();
        }}
        className="mt-3 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4"
      >
        {isPicking ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons
            name="images-outline"
            size={21}
            color={colors.primary}
          />
        )}
        <Text className="font-semibold text-foreground">
          {previewUri ? 'Zameni fotografiju' : 'Dodaj fotografiju'}
        </Text>
      </Pressable>

      <Text className="mt-2 text-sm text-muted">
        JPEG, PNG ili WebP, najviše 5 MB.
      </Text>

      {error && (
        <Text className="mt-2 text-sm text-error">
          {error}
        </Text>
      )}
    </View>
  );
}
