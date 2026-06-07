import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import { LabelTitle } from "@repo/ui/components/label-title";
import { IconX16 } from "@repo/ui/tokens/icons";
import type { ChangeEvent, RefObject } from "react";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { MAX_REPORT_PHOTOS } from "../model/report-types";
import { ReportSectionError } from "./ReportSectionError";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import {
  agreementSection,
  imageDeleteButton,
  imagePreview,
  imageWrapper,
  photoPreviewUploadOverlay,
  photoPreviewUploadSpinner,
  photoUploadArea,
  reportPhotoGallery,
  section,
  sectionTitleRow,
} from "./report.css.ts";

interface ReportPhotoSectionProps {
  uploadedImages: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageClick: () => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  isSubmitting?: boolean;
  isAgreed: boolean;
  setIsAgreed: (val: boolean) => void;
  agreementServerError?: string;
  onAgreementChange?: () => void;
}

export function ReportPhotoSection({
  uploadedImages,
  fileInputRef,
  onImageClick,
  onImageChange,
  onImageRemove,
  isSubmitting = false,
  isAgreed,
  setIsAgreed,
  agreementServerError,
  onAgreementChange,
}: ReportPhotoSectionProps) {
  const agreementError = useReportSectionError(
    ["locationConsentAgreed"],
    agreementServerError,
  );
  const agreementErrorId = agreementError ? "report-agreement-error" : undefined;
  const isPhotoUploading = isSubmitting && uploadedImages.length > 0;

  return (
    <section className={section} data-section="photo">
      <LabelTitle size="small">
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
      </LabelTitle>
      <div
        className={reportPhotoGallery}
        data-has-images={uploadedImages.length > 0 ? "true" : "false"}
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

        {/* Image Gallery */}
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
      <div
        className={agreementSection}
        data-section="agreement"
        style={{ marginTop: "16px" }}
        aria-describedby={agreementErrorId}
      >
        <div className={sectionTitleRow}>
          <Checkbox
            labelText={m.report_location_agreement()}
            isSelected={isAgreed}
            onSelectedChange={(selected) => {
              setIsAgreed(selected);
              onAgreementChange?.();
            }}
            labelLocation="right"
          />
          <ReportSectionError
            id={agreementErrorId}
            message={agreementError}
            placement="title"
          />
        </div>
        <ReportSectionErrorReserve />
        {/* 롤백용: 하단 에러 영역 — Reserve 제거 후 주석 해제
        <ReportSectionError
          id={agreementErrorId}
          message={agreementError}
          placement="bottom"
        />
        */}
      </div>
    </section>
  );
}
