import { m } from "@repo/i18n";
import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type {
  LockerType,
  ReportFormValues,
} from "#/features/report/model/report-types";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { ReportIndoorOutdoorSection } from "./ReportIndoorOutdoorSection";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportTypeSection } from "./ReportTypeSection";
import { classificationSection } from "./report.css.ts";

interface ReportClassificationSectionProps {
  lockerTypeOptions: Array<{ label: string; value: LockerType }>;
  floorSection?: ReactNode;
  sectionServerError?: string;
  onFieldChange?: () => void;
}

export function ReportClassificationSection({
  lockerTypeOptions,
  floorSection,
  sectionServerError,
  onFieldChange,
}: ReportClassificationSectionProps) {
  const { control } = useFormContext<ReportFormValues>();
  const indoorOutdoorErrorMessage = useReportSectionError([
    "indoorOutdoorType",
  ]);
  const lockerTypeErrorMessage = useReportSectionError(
    ["lockerType"],
    sectionServerError,
  );
  const indoorOutdoorErrorId = indoorOutdoorErrorMessage
    ? "report-indoor-outdoor-error"
    : undefined;
  const lockerTypeErrorId = lockerTypeErrorMessage
    ? "report-locker-type-error"
    : undefined;

  const handleIndoorOutdoorChange = (
    onChange: (value: ReportFormValues["indoorOutdoorType"]) => void,
    value: ReportFormValues["indoorOutdoorType"],
  ) => {
    onChange(value);
    onFieldChange?.();
  };

  const handleLockerTypeChange = (
    onChange: (value: ReportFormValues["lockerType"]) => void,
    value: ReportFormValues["lockerType"],
  ) => {
    onChange(value);
    onFieldChange?.();
  };

  return (
    <div
      className={classificationSection}
      data-section="classification"
      aria-describedby={indoorOutdoorErrorId ?? lockerTypeErrorId}
    >
      <Controller
        control={control}
        name="indoorOutdoorType"
        render={({ field }) => (
          <ReportIndoorOutdoorSection
            value={field.value ?? null}
            sectionErrorMessage={indoorOutdoorErrorMessage}
            sectionErrorId={indoorOutdoorErrorId}
            onChange={(value) =>
              handleIndoorOutdoorChange(field.onChange, value)
            }
          />
        )}
      />
      {floorSection}
      <Controller
        control={control}
        name="lockerType"
        render={({ field }) => (
          <ReportTypeSection
            lockerType={field.value ?? null}
            onChange={(value) => handleLockerTypeChange(field.onChange, value)}
            options={lockerTypeOptions}
            errorMessage={lockerTypeErrorMessage}
            errorId={lockerTypeErrorId}
            defaultErrorMessage={m.report_error_required()}
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
