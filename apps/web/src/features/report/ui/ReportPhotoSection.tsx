import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import { IconNavigationRefresh24, IconX16 } from "@repo/ui/tokens/icons";
import { useNavigate } from "@tanstack/react-router";
import type { ChangeEvent, RefObject } from "react";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { buildLegalReturnSearch } from "#/features/settings/legal/model/legal-return-search";
import { MAX_REPORT_PHOTOS } from "../model/report-types";
import { ReportSectionError } from "./ReportSectionError";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  agreementCheckRow,
  agreementLabel,
  agreementSection,
  imageDeleteButton,
  imagePreview,
  imageWrapper,
  photoAgreementGroup,
  photoErrorIconCircle,
  photoPreviewErrorOverlay,
  photoPreviewUploadOverlay,
  photoPreviewUploadSpinner,
  photoUploadArea,
  photoUploadErrorMessage,
  privacyPolicyLink,
  privacyPolicyLinkRow,
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
  agreementServerError?: string;
  isAgreed: boolean;
  setIsAgreed: (val: boolean) => void;
  onPrivacyPolicyNavigate?: () => void;
}

export function ReportPhotoSection({
  uploadedImages,
  fileInputRef,
  onImageClick,
  onImageChange,
  onImageRemove,
  isSubmitting = false,
  photoServerError,
  agreementServerError,
  isAgreed,
  setIsAgreed,
  onPrivacyPolicyNavigate,
}: ReportPhotoSectionProps) {
  const navigate = useNavigate();
  const photoError = useReportSectionError(["imageUrl"], photoServerError);
  const agreementError = useReportSectionError(
    ["locationConsentAgreed"],
    agreementServerError,
  );
  const photoErrorId = photoError ? "report-photo-error" : undefined;
  const agreementErrorId = agreementError
    ? "report-agreement-error"
    : undefined;
  const isPhotoUploading = isSubmitting && uploadedImages.length > 0;
  const hasUploadedImage = uploadedImages.length > 0;
  const isAgreementDisabled = !hasUploadedImage || isSubmitting;

  return (
    <section
      className={section}
      data-section="photo"
      aria-describedby={photoErrorId}
    >
      <ReportSectionTitleRow errorMessage={photoError} errorId={photoErrorId}>
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
              data-state={photoError ? "error" : undefined}
              onClick={onImageClick}
              disabled={isSubmitting}
            >
              {photoError ? (
                <>
                  <span className={photoErrorIconCircle} aria-hidden="true">
                    <IconNavigationRefresh24 />
                  </span>
                  <span className={photoUploadErrorMessage}>
                    {m.report_photo_upload_failed_card()}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 9V3H11V9H17V11H11V17H9V11H3V9H9Z"
                      fill="#8E8E8E"
                    />
                  </svg>
                  <span style={{ fontSize: "12px", color: "#8E8E8E" }}>
                    {m.report_photo_upload()}
                  </span>
                </>
              )}
            </button>
          )}

          {uploadedImages.map((url, index) => (
            <div
              key={url}
              className={imageWrapper}
              data-state={photoError ? "error" : undefined}
              aria-busy={isPhotoUploading ? true : undefined}
            >
              <img
                src={url}
                alt={m.report_photo_uploaded_alt({ index: index + 1 })}
                className={imagePreview}
              />
              {isPhotoUploading ? (
                <output
                  className={photoPreviewUploadOverlay}
                  aria-live="polite"
                  aria-label={m.report_photo_uploading()}
                >
                  <div
                    className={photoPreviewUploadSpinner}
                    aria-hidden="true"
                  />
                </output>
              ) : null}
              {photoError && !isPhotoUploading ? (
                <div className={photoPreviewErrorOverlay}>
                  <span className={photoErrorIconCircle} aria-hidden="true">
                    <IconNavigationRefresh24 />
                  </span>
                  <span className={photoUploadErrorMessage}>
                    {m.report_photo_upload_failed_card()}
                  </span>
                </div>
              ) : null}
              <button
                type="button"
                className={imageDeleteButton}
                onClick={() => onImageRemove(index)}
                disabled={isSubmitting}
                aria-label={m.report_photo_delete_aria({ index: index + 1 })}
              >
                <IconX16 />
              </button>
            </div>
          ))}
        </div>
        <div
          className={agreementSection}
          data-section="agreement"
          aria-describedby={agreementErrorId}
        >
          <div
            className={agreementCheckRow}
            data-disabled={isAgreementDisabled ? "true" : "false"}
          >
            <Checkbox
              aria-label={m.report_photo_exif_agreement_aria()}
              isSelected={isAgreed}
              onSelectedChange={setIsAgreed}
              labelLocation="none"
              isDisabled={isAgreementDisabled}
              aria-describedby={agreementErrorId}
            />
            <span className={agreementLabel}>
              {m.report_photo_exif_agreement_label()}
            </span>
          </div>
          <div className={privacyPolicyLinkRow}>
            <button
              type="button"
              className={privacyPolicyLink}
              onClick={() => {
                onPrivacyPolicyNavigate?.();
                navigate({
                  to: "/settings/privacy",
                  search: buildLegalReturnSearch("/report"),
                });
              }}
            >
              {m.report_photo_privacy_policy_link()}
            </button>
          </div>
          <ReportSectionError
            message={agreementError}
            id={agreementErrorId}
            placement="bottom"
          />
        </div>
      </div>
      <ReportSectionErrorReserve />
    </section>
  );
}
