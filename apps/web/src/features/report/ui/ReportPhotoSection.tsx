import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import { LabelTitle } from "@repo/ui/components/label-title";
import { IconX16 } from "@repo/ui/tokens/icons";
import type { ChangeEvent, RefObject } from "react";
import { MAX_REPORT_PHOTOS } from "../model/report-types";
import {
  agreementSection,
  imageDeleteButton,
  imagePreview,
  imageWrapper,
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
  isAgreed: boolean;
  setIsAgreed: (val: boolean) => void;
}

export function ReportPhotoSection({
  uploadedImages,
  fileInputRef,
  onImageClick,
  onImageChange,
  onImageRemove,
  isAgreed,
  setIsAgreed,
}: ReportPhotoSectionProps) {
  return (
    <section className={section}>
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
          <div key={url} className={imageWrapper}>
            <img
              src={url}
              alt={m.report_photo_uploaded_alt({ index: index + 1 })}
              className={imagePreview}
            />
            <button
              type="button"
              className={imageDeleteButton}
              onClick={() => onImageRemove(index)}
            >
              <IconX16 />
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "12px", color: "#8E8E8E", marginTop: "8px" }}>
        {m.report_photo_upload_deferred_hint()}
      </p>
      <div className={agreementSection} style={{ marginTop: "16px" }}>
        <Checkbox
          labelText={m.report_location_agreement()}
          isSelected={isAgreed}
          onSelectedChange={setIsAgreed}
          labelLocation="right"
        />
      </div>
    </section>
  );
}
