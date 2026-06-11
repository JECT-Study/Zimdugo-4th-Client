import type { ReportFormValues } from "#/features/report/model/report-types";

type RequiresExifConsentInput = {
  imageUrl: ReportFormValues["imageUrl"];
  uploadedImageCount: number;
  hasSelectedPhotoFile: boolean;
};

/** EXIF 동의가 필요한 경우: 사진 미리보기·선택 파일·저장된 imageUrl 중 하나라도 있을 때 */
export const requiresExifConsent = ({
  imageUrl,
  uploadedImageCount,
  hasSelectedPhotoFile,
}: RequiresExifConsentInput): boolean =>
  uploadedImageCount > 0 || hasSelectedPhotoFile || imageUrl !== null;
