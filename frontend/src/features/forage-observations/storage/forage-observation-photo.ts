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
  const photo = new File(
    Paths.document,
    'forage-observations',
    observationId,
    'photo.jpg',
  );

  return photo.exists
    ? photo.uri
    : null;
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

  await source.copy(destination, {
    overwrite: true,
  });

  return destination.uri;
}
