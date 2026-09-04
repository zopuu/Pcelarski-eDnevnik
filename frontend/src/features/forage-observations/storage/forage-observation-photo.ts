import {
  Directory,
  File,
  Paths,
} from 'expo-file-system';
import {
  manipulateAsync,
  SaveFormat,
} from 'expo-image-manipulator';

import type {
  ObservationPhotoDraft,
} from '../components/observation-photo-picker';

const maximumPhotoDimension = 1_600;
const jpegCompression = 0.75;

export function getForageObservationPhotoUri(
  observationId: string,
): string | null {
  try {
    const photo = new File(
      Paths.document,
      'forage-observations',
      observationId,
      'photo.jpg',
    );

    return photo.exists
      ? photo.uri
      : null;
  } catch {
    return null;
  }
}

export function deleteForageObservationPhoto(
  observationId: string,
): void {
  try {
    const photo = new File(
      Paths.document,
      'forage-observations',
      observationId,
      'photo.jpg',
    );

    if (photo.exists) {
      photo.delete();
    }
  } catch {
    // The API deletion remains successful even when this device has no local photo.
  }
}

export async function saveForageObservationPhoto(
  observationId: string,
  photo: ObservationPhotoDraft,
): Promise<string> {
  const longestEdge = Math.max(
    photo.width,
    photo.height,
  );
  const resizeAction =
    longestEdge > maximumPhotoDimension
      ? photo.width >= photo.height
        ? {
          resize: {
            width: maximumPhotoDimension,
          },
        }
        : {
          resize: {
            height: maximumPhotoDimension,
          },
        }
      : undefined;

  const compressedPhoto =
    await manipulateAsync(
      photo.uri,
      resizeAction
        ? [resizeAction]
        : [],
      {
        compress: jpegCompression,
        format: SaveFormat.JPEG,
      },
    );

  const observationDirectory =
    new Directory(
      Paths.document,
      'forage-observations',
      observationId,
    );

  observationDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const destination =
    new File(
      observationDirectory,
      'photo.jpg',
    );
  const source =
    new File(compressedPhoto.uri);

  if (destination.exists) {
    destination.delete();
  }

  await source.copy(destination);

  return destination.uri;
}
