import type { ApiaryImageUpload } from '../types/apiary-image';
import { appendImageToFormData } from '@/shared/api/image-upload';

export async function appendApiaryImage(
  formData: FormData,
  image: ApiaryImageUpload | null | undefined,
): Promise<void> {
  await appendImageToFormData(formData, 'Image', image);
}
