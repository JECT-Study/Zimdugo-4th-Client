import { Controller, useFormContext } from "react-hook-form";
import type { LockerType, ReportFormValues } from "#/features/report/model/report-types";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { ReportIndoorOutdoorSection } from "./ReportIndoorOutdoorSection";
import { ReportTypeSection } from "./ReportTypeSection";
import { classificationSection } from "./report.css.ts";
import { ReportSectionError } from "./ReportSectionError";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";

interface ReportClassificationSectionProps {
  lockerTypeOptions: Array<{ label: string; value: LockerType }>;
  sectionServerError?: string;
  onFieldChange?: () => void;
}

export function ReportClassificationSection({
  lockerTypeOptions,
  sectionServerError,
  onFieldChange,
}: ReportClassificationSectionProps) {
  const { control } = useFormContext<ReportFormValues>();
  const errorMessage = useReportSectionError(
    ["indoorOutdoorType", "lockerType"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-classification-error" : undefined;

  return (
    <div
      className={classificationSection}
      data-section="classification"
      aria-describedby={errorId}
    >
      <Controller
        control={control}
        name="indoorOutdoorType"
        render={({ field }) => (
          <ReportIndoorOutdoorSection
            value={field.value ?? null}
            sectionErrorMessage={errorMessage}
            sectionErrorId={errorId}
            onChange={(value) => {
              field.onChange(value);
              onFieldChange?.();
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="lockerType"
        render={({ field }) => (
          <ReportTypeSection
            lockerType={field.value ?? null}
            onChange={(value) => {
              field.onChange(value);
              onFieldChange?.();
            }}
            options={lockerTypeOptions}
          />
        )}
      />
      <ReportSectionErrorReserve />
      {/* 롤백용: 하단 에러 영역 — Reserve 제거 후 주석 해제
      <ReportSectionError
        id={errorId}
        message={errorMessage}
        placement="bottom"
      />
      */}
    </div>
  );
}
