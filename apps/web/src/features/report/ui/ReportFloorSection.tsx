import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import {
  PopupPicker,
  type PopupPickerColumn,
} from "@repo/ui/components/popup-picker";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { ReportFormValues } from "#/features/report/model/report-types";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { PickerTriggerButton } from "./PickerTriggerButton";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  disabledSection,
  floorChoiceButton,
  floorControlRow,
  placeType,
  requiredMark,
  section,
} from "./report.css.ts";

interface ReportFloorSectionProps {
  isDisabled?: boolean;
  sectionServerError?: string;
  onFieldChange?: () => void;
}

const MAX_FLOOR = 99;
const DEFAULT_FLOOR_VALUE = "1";

const parseFloorPickerValue = (
  value: string,
): Pick<ReportFormValues, "floorType" | "floorNumber"> | null => {
  const floor = Number.parseInt(value, 10);

  if (Number.isNaN(floor) || floor === 0) return null;

  return {
    floorType: floor < 0 ? "UNDERGROUND" : "ABOVE_GROUND",
    floorNumber: Math.abs(floor),
  };
};

const pickerValueFromFloor = (
  floorType: ReportFormValues["floorType"],
  floorNumber: ReportFormValues["floorNumber"],
): string => {
  if (floorNumber === null || floorNumber < 1) return DEFAULT_FLOOR_VALUE;

  return floorType === "UNDERGROUND"
    ? String(-floorNumber)
    : String(floorNumber);
};

const getFloorLabel = (
  floorType: ReportFormValues["floorType"],
  floorNumber: ReportFormValues["floorNumber"],
): string => {
  if (floorNumber === null || !floorType) {
    return m.report_floor_select_placeholder();
  }

  return floorType === "UNDERGROUND" ? `B${floorNumber}` : `${floorNumber}F`;
};

const getFloorOptionLabel = (floor: number): string => {
  return floor < 0 ? `B${Math.abs(floor)}` : `${floor}F`;
};

export function ReportFloorSection({
  isDisabled = false,
  sectionServerError,
  onFieldChange,
}: ReportFloorSectionProps) {
  const { control, setValue } = useFormContext<ReportFormValues>();
  const hasFloor = useWatch({ control, name: "hasFloor" });
  const floorType = useWatch({ control, name: "floorType" });
  const floorNumber = useWatch({ control, name: "floorNumber" });
  const errorMessage = useReportSectionError(
    ["hasFloor", "floorType", "floorNumber"],
    sectionServerError,
  );
  const [isFloorPickerOpen, setIsFloorPickerOpen] = useState(false);
  const [pendingFloor, setPendingFloor] = useState(DEFAULT_FLOOR_VALUE);

  const floorOptions = useMemo(() => {
    const aboveGroundFloors = Array.from(
      { length: MAX_FLOOR },
      (_, index) => MAX_FLOOR - index,
    );
    const undergroundFloors = Array.from(
      { length: MAX_FLOOR },
      (_, index) => -(index + 1),
    );

    return [...aboveGroundFloors, ...undergroundFloors].map((floor) => ({
      value: String(floor),
      label: getFloorOptionLabel(floor),
    }));
  }, []);

  const floorPickerColumns = useMemo<PopupPickerColumn[]>(
    () => [
      {
        id: "floor",
        value: pendingFloor,
        options: floorOptions,
        ariaLabel: m.report_floor_number_aria(),
      },
    ],
    [floorOptions, pendingFloor],
  );

  const isNoFloorSelected = hasFloor === false;
  const isHasFloorSelected = hasFloor === true;
  const errorId = errorMessage ? "report-floor-error" : undefined;
  const floorLabel = isHasFloorSelected
    ? getFloorLabel(floorType, floorNumber)
    : m.report_floor_select_placeholder();

  const handleSelectNoFloor = () => {
    if (isDisabled) return;

    setValue("hasFloor", false, { shouldDirty: true });
    setValue("floorType", null, { shouldDirty: true });
    setValue("floorNumber", null, { shouldDirty: true });
    setIsFloorPickerOpen(false);
    onFieldChange?.();
  };

  const handleSelectHasFloor = () => {
    if (isDisabled) return;

    setValue("hasFloor", true, { shouldDirty: true });
    onFieldChange?.();
  };

  const handleOpenFloorPicker = () => {
    if (isDisabled) return;

    setPendingFloor(pickerValueFromFloor(floorType, floorNumber));
    setIsFloorPickerOpen(true);
  };

  const handleFloorPickerChange = (columnId: string, value: string) => {
    if (columnId === "floor") {
      setPendingFloor(value);
    }
  };

  const handleConfirmFloor = () => {
    if (isDisabled) return;

    const nextFloor = parseFloorPickerValue(pendingFloor);
    if (!nextFloor) return;

    setValue("hasFloor", true, { shouldDirty: true });
    setValue("floorType", nextFloor.floorType, { shouldDirty: true });
    setValue("floorNumber", nextFloor.floorNumber, { shouldDirty: true });
    onFieldChange?.();
  };

  return (
    <section
      className={[section, isDisabled ? disabledSection : ""]
        .filter(Boolean)
        .join(" ")}
      data-section="floor"
      aria-disabled={isDisabled}
      aria-describedby={errorId}
    >
      <ReportSectionTitleRow
        errorMessage={errorMessage}
        defaultErrorMessage={m.report_error_required()}
        errorId={errorId}
      >
        {m.report_section_floor()}
        <span className={requiredMark}>*</span>
      </ReportSectionTitleRow>
      <div className={placeType}>
        <div className={floorControlRow}>
          <Button
            className={floorChoiceButton}
            variant={isNoFloorSelected ? "filled" : "outline"}
            intent={isNoFloorSelected ? "primary" : "neutral"}
            size="L"
            onPress={handleSelectNoFloor}
            isDisabled={isDisabled}
          >
            {m.report_floor_none()}
          </Button>
          <Button
            className={floorChoiceButton}
            variant={isHasFloorSelected ? "filled" : "outline"}
            intent={isHasFloorSelected ? "primary" : "neutral"}
            size="L"
            onPress={handleSelectHasFloor}
            isDisabled={isDisabled}
          >
            {m.report_floor_exists()}
          </Button>
          <PickerTriggerButton
            label={floorLabel}
            ariaLabel={m.report_floor_select_aria()}
            onPress={handleOpenFloorPicker}
            isDisabled={isDisabled || !isHasFloorSelected}
          />
        </div>
      </div>

      <PopupPicker
        isOpen={isFloorPickerOpen}
        onOpenChange={setIsFloorPickerOpen}
        titleText={m.report_floor_picker_title()}
        columns={floorPickerColumns}
        onColumnChange={handleFloorPickerChange}
        primaryAction={{
          label: m.report_floor_picker_confirm(),
          onPress: handleConfirmFloor,
        }}
      />

      <ReportSectionErrorReserve />
    </section>
  );
}
