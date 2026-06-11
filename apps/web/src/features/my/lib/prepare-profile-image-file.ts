import { resolveProfilePhotoContentType } from "#/features/my/lib/validate-profile-photo-file";
import { MAX_REPORT_PHOTO_SIZE_BYTES } from "#/features/report/model/report-types";

const MAX_PROFILE_IMAGE_DIMENSION = 512;
const PROFILE_IMAGE_JPEG_QUALITY = 0.85;
const RESIZABLE_CONTENT_TYPES = new Set(["image/jpeg", "image/png"]);

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image."));
    };

    image.src = objectUrl;
  });

const resizeImageToJpeg = (
  image: HTMLImageElement,
  maxDimension: number,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.width, image.height),
    );
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Canvas is not supported."));
      return;
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode image."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });

const shouldResizeProfileImage = (file: File): boolean => {
  const contentType = resolveProfilePhotoContentType(file);
  return RESIZABLE_CONTENT_TYPES.has(contentType);
};

const toResizedProfileImageFile = async (file: File): Promise<File> => {
  const image = await loadImageFromFile(file);
  const maxDimension = Math.max(image.width, image.height);

  if (
    maxDimension <= MAX_PROFILE_IMAGE_DIMENSION &&
    file.size <= MAX_REPORT_PHOTO_SIZE_BYTES
  ) {
    return file;
  }

  const blob = await resizeImageToJpeg(
    image,
    MAX_PROFILE_IMAGE_DIMENSION,
    PROFILE_IMAGE_JPEG_QUALITY,
  );
  const baseName = file.name.replace(/\.[^.]+$/, "") || "profile-image";

  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
};

export async function prepareProfileImageFile(file: File): Promise<File> {
  if (!shouldResizeProfileImage(file)) {
    return file;
  }

  try {
    return await toResizedProfileImageFile(file);
  } catch {
    return file;
  }
}
