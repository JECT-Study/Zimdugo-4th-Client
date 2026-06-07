import { m } from "@repo/i18n";
import { useEffect, useRef } from "react";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { MAX_REPORT_ADDITIONAL_INFO_LENGTH } from "../model/report-types";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  charCounter,
  section,
  textareaContainer,
  textareaField,
} from "./report.css.ts";

interface ReportAdditionalInfoSectionProps {
  additionalInfo: string;
  setAdditionalInfo: (val: string) => void;
  sectionServerError?: string;
  onFieldChange?: () => void;
}

export function ReportAdditionalInfoSection({
  additionalInfo,
  setAdditionalInfo,
  sectionServerError,
  onFieldChange,
}: ReportAdditionalInfoSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorMessage = useReportSectionError(
    ["additionalInfo"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-additional-info-error" : undefined;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [additionalInfo]);

  return (
    <section
      className={section}
      data-section="additionalInfo"
      aria-describedby={errorId}
    >
      <ReportSectionTitleRow errorMessage={errorMessage} errorId={errorId}>
        {m.report_section_additional()}
      </ReportSectionTitleRow>
      <div className={textareaContainer}>
        <textarea
          ref={textareaRef}
          placeholder={m.report_additional_placeholder()}
          value={additionalInfo}
          onChange={(e) => {
            setAdditionalInfo(
              e.target.value.slice(0, MAX_REPORT_ADDITIONAL_INFO_LENGTH),
            );
            onFieldChange?.();
          }}
          className={textareaField}
          style={{ overflow: "hidden" }}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorId}
        />
        <div className={charCounter}>
          {additionalInfo.length}/{MAX_REPORT_ADDITIONAL_INFO_LENGTH}
        </div>
      </div>
      <ReportSectionErrorReserve />
    </section>
  );
}
