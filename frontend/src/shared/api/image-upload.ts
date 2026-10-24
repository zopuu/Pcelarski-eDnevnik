import { Platform } from 'react-native';
import { File } from 'expo-file-system';

export type ImageUpload = {
  uri: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
};

export async function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  image: ImageUpload | null | undefined,
): Promise<void> {
  if (!image) {
    return;
  }

  if (Platform.OS === 'web') {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    formData.append(fieldName, blob, image.fileName);
    return;
  }

  formData.append(fieldName, new File(image.uri));
}
