import { m } from "@repo/i18n";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { MAX_REPORT_ADDITIONAL_INFO_LENGTH } from "../model/report-types";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import { ReportTextareaField } from "./ReportTextareaField";
import { section } from "./report.css.ts";

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
  const errorMessage = useReportSectionError(
    ["additionalInfo"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-additional-info-error" : undefined;

  return (
    <section
      className={section}
      data-section="additionalInfo"
      aria-describedby={errorId}
    >
      <ReportSectionTitleRow errorMessage={errorMessage} errorId={errorId}>
        {m.report_section_additional()}
      </ReportSectionTitleRow>
      <ReportTextareaField
        id="report-additional-info"
        value={additionalInfo}
        placeholder={m.report_additional_placeholder()}
        maxLength={MAX_REPORT_ADDITIONAL_INFO_LENGTH}
        isInvalid={Boolean(errorMessage)}
        describedBy={errorId}
        onChange={(value) => {
          setAdditionalInfo(value);
          onFieldChange?.();
        }}
      />
      <ReportSectionErrorReserve />
    </section>
  );
}
