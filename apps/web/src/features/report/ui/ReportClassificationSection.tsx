import { m } from "@repo/i18n";
import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
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
  floorSection?: (props: { isDisabled: boolean }) => ReactNode;
  sectionServerError?: string;
  onFieldChange?: () => void;
  onFloorReset?: () => void;
}

export function ReportClassificationSection({
  lockerTypeOptions,
  floorSection,
  sectionServerError,
  onFieldChange,
  onFloorReset,
}: ReportClassificationSectionProps) {
  const { clearErrors, control, setValue } = useFormContext<ReportFormValues>();
  const indoorOutdoorType = useWatch({ control, name: "indoorOutdoorType" });
  const hasFloor = useWatch({ control, name: "hasFloor" });
  const floorType = useWatch({ control, name: "floorType" });
  const floorNumber = useWatch({ control, name: "floorNumber" });
  const indoorOutdoorErrorMessage = useReportSectionError([
    "indoorOutdoorType",
  ]);
  const lockerTypeErrorMessage = useReportSectionError(
    ["lockerType"],
    sectionServerError,
  );

  const resetFloorToNone = useCallback(() => {
    setValue("hasFloor", false, { shouldDirty: true });
    setValue("floorType", null, { shouldDirty: true });
    setValue("floorNumber", null, { shouldDirty: true });
    clearErrors(["hasFloor", "floorType", "floorNumber"]);
    onFloorReset?.();
  }, [clearErrors, onFloorReset, setValue]);

  const isFloorDisabled = indoorOutdoorType === "OUTDOOR";
  const isFloorFixedToNone =
    hasFloor === false && floorType === null && floorNumber === null;
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
    if (value === "OUTDOOR") {
      resetFloorToNone();
    }
    onFieldChange?.();
  };

  const handleLockerTypeChange = (
    onChange: (value: ReportFormValues["lockerType"]) => void,
    value: ReportFormValues["lockerType"],
  ) => {
    onChange(value);
    onFieldChange?.();
  };

  useEffect(() => {
    if (isFloorDisabled && !isFloorFixedToNone) {
      resetFloorToNone();
    }
  }, [isFloorDisabled, isFloorFixedToNone, resetFloorToNone]);

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
      {floorSection?.({ isDisabled: isFloorDisabled })}
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
    </div>
  );
}
