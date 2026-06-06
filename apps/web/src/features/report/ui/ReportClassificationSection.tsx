import { Controller, useFormContext } from "react-hook-form";
import type { LockerType, ReportFormValues } from "#/features/report/model/report-types";
import { ReportIndoorOutdoorSection } from "./ReportIndoorOutdoorSection";
import { ReportTypeSection } from "./ReportTypeSection";
import { classificationSection, sectionErrorText } from "./report.css.ts";

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
  const { control, formState } = useFormContext<ReportFormValues>();

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
      <Controller
        control={control}
        name="indoorOutdoorType"
        render={({ field }) => (
          <ReportIndoorOutdoorSection
            value={field.value ?? null}
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
      {mergedError ? (
        <p id={errorId} className={sectionErrorText} role="alert">
          {mergedError}
        </p>
      ) : null}
    </div>
  );
}
