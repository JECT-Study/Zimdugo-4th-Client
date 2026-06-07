import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import { IconX16 } from "@repo/ui/tokens/icons";
import type { ChangeEvent, RefObject } from "react";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { MAX_REPORT_PHOTOS } from "../model/report-types";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  agreementSection,
  imageDeleteButton,
  imagePreview,
  imageWrapper,
  photoAgreementGroup,
  photoPreviewUploadOverlay,
  photoPreviewUploadSpinner,
  photoUploadArea,
  reportPhotoGallery,
  section,
} from "./report.css.ts";

interface ReportPhotoSectionProps {
  uploadedImages: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageClick: () => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  isSubmitting?: boolean;
  photoServerError?: string;
  isAgreed: boolean;
  setIsAgreed: (val: boolean) => void;
}

export function ReportPhotoSection({
  uploadedImages,
  fileInputRef,
  onImageClick,
  onImageChange,
  onImageRemove,
  isSubmitting = false,
  photoServerError,
  isAgreed,
  setIsAgreed,
}: ReportPhotoSectionProps) {
  const photoError = useReportSectionError(["imageUrl"], photoServerError);
  const photoErrorId = photoError ? "report-photo-error" : undefined;
  const isPhotoUploading = isSubmitting && uploadedImages.length > 0;

  return (
    <section className={section} data-section="photo" aria-describedby={photoErrorId}>
      <ReportSectionTitleRow errorMessage={photoError} errorId={photoErrorId}>
        <>
          {m.report_section_photo()}
          <span
            style={{
              fontSize: "12px",
              color: "#ADB5BD",
              marginLeft: "8px",
              fontWeight: "normal",
            }}
          >
            ({uploadedImages.length}/{MAX_REPORT_PHOTOS})
          </span>
        </>
      </ReportSectionTitleRow>
      <div className={photoAgreementGroup}>
        <div
          className={reportPhotoGallery}
          data-has-images={uploadedImages.length > 0 ? "true" : "false"}
          aria-invalid={photoError ? true : undefined}
          aria-describedby={photoErrorId}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          {uploadedImages.length < MAX_REPORT_PHOTOS && (
            <button
              type="button"
              className={photoUploadArea}
              onClick={onImageClick}
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path d="M9 9V3H11V9H17V11H11V17H9V11H3V9H9Z" fill="#8E8E8E" />
              </svg>
              <span style={{ fontSize: "12px", color: "#8E8E8E" }}>
                {m.report_photo_upload()}
              </span>
            </button>
          )}

          {uploadedImages.map((url, index) => (
            <div
              key={url}
              className={imageWrapper}
              aria-busy={isPhotoUploading ? true : undefined}
            >
              <img
                src={url}
                alt={m.report_photo_uploaded_alt({ index: index + 1 })}
                className={imagePreview}
              />
              {isPhotoUploading ? (
                <div
                  className={photoPreviewUploadOverlay}
                  aria-live="polite"
                  aria-label={m.report_photo_uploading()}
                >
                  <div className={photoPreviewUploadSpinner} aria-hidden="true" />
                </div>
              ) : null}
              <button
                type="button"
                className={imageDeleteButton}
                onClick={() => onImageRemove(index)}
                disabled={isSubmitting}
              >
                <IconX16 />
              </button>
            </div>
          ))}
        </div>
        <div className={agreementSection} data-section="agreement">
          <Checkbox
            labelText={m.report_location_agreement()}
            isSelected={isAgreed}
            onSelectedChange={setIsAgreed}
            labelLocation="right"
          />
        </div>
      </div>
      <ReportSectionErrorReserve />
    </section>
  );
}
