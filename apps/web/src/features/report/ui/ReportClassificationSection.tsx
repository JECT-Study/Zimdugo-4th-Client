import { useFormContext } from "react-hook-form";
import type { LockerType, ReportFormValues } from "#/features/report/model/report-types";
import { ReportIndoorOutdoorSection } from "./ReportIndoorOutdoorSection";
import { ReportTypeSection } from "./ReportTypeSection";
import { classificationSection, sectionErrorText } from "./report.css.ts";

interface ReportClassificationSectionProps {
  lockerTypeOptions: Array<{ label: string; value: LockerType }>;
  sectionServerError?: string;
  onIndoorOutdoorChange: (value: NonNullable<ReportFormValues["indoorOutdoorType"]>) => void;
  onLockerTypeChange: (value: LockerType | null) => void;
}

export function ReportClassificationSection({
  lockerTypeOptions,
  sectionServerError,
  onIndoorOutdoorChange,
  onLockerTypeChange,
}: ReportClassificationSectionProps) {
  const { watch, formState } = useFormContext<ReportFormValues>();
  const indoorOutdoorType = watch("indoorOutdoorType");
  const lockerType = watch("lockerType");

  const mergedError =
    sectionServerError ??
    formState.errors.lockerType?.message ??
    formState.errors.indoorOutdoorType?.message;

  const errorId = mergedError ? "report-classification-error" : undefined;

  return (
    <div
      className={classificationSection}
      data-section="classification"
      aria-describedby={errorId}
    >
      <ReportIndoorOutdoorSection
        value={indoorOutdoorType ?? null}
        onChange={onIndoorOutdoorChange}
      />
      <ReportTypeSection
        lockerType={lockerType ?? null}
        onChange={onLockerTypeChange}
        options={lockerTypeOptions}
      />
      {mergedError ? (
        <p id={errorId} className={sectionErrorText} role="alert">
          {mergedError}
        </p>
      ) : null}
    </div>
  );
}
