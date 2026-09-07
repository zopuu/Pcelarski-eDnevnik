import {
  Platform,
} from 'react-native';
import {
  File,
} from 'expo-file-system';

import type {
  ApiaryImageUpload,
} from '../types/apiary-image';

export async function appendApiaryImage(
  formData: FormData,
  image: ApiaryImageUpload | null | undefined,
): Promise<void> {
  if (!image) {
    return;
  }

  if (Platform.OS === 'web') {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    formData.append('Image', blob, image.fileName);
    return;
  }

  formData.append('Image', new File(image.uri));
}
