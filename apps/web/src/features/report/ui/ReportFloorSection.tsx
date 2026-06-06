import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { LabelTitle } from "@repo/ui/components/label-title";
import {
  PopupPicker,
  type PopupPickerColumn,
} from "@repo/ui/components/popup-picker";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { ReportFormValues } from "#/features/report/model/report-types";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { PickerTriggerButton } from "./PickerTriggerButton";
import { ReportSectionError } from "./ReportSectionError";
import {
  floorChoiceButton,
  floorControlRow,
  placeType,
  requiredMark,
  section,
} from "./report.css.ts";

interface ReportFloorSectionProps {
  sectionServerError?: string;
  onFieldChange?: () => void;
}

const FLOOR_SCOPE = {
  ground: "ground",
  underground: "underground",
} as const;

type FloorScope = (typeof FLOOR_SCOPE)[keyof typeof FLOOR_SCOPE];

const normalizeFloorScope = (value: string): FloorScope => {
  if (
    value === FLOOR_SCOPE.underground ||
    value === m.report_floor_underground()
  ) {
    return FLOOR_SCOPE.underground;
  }

  return FLOOR_SCOPE.ground;
};

const scopeFromFloorType = (
  floorType: ReportFormValues["floorType"],
): FloorScope => {
  if (floorType === "UNDERGROUND") return FLOOR_SCOPE.underground;
  return FLOOR_SCOPE.ground;
};

export function ReportFloorSection({
  sectionServerError,
  onFieldChange,
}: ReportFloorSectionProps) {
  const { control, setValue } = useFormContext<ReportFormValues>();
  const hasFloor = useWatch({ control, name: "hasFloor" });
  const floorType = useWatch({ control, name: "floorType" });
  const floorNumber = useWatch({ control, name: "floorNumber" });

  const isNoFloorSelected = hasFloor === false;
  const isHasFloorSelected = hasFloor === true;

  const errorMessage = useReportSectionError(
    ["hasFloor", "floorType", "floorNumber"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-floor-error" : undefined;

  const [isFloorPickerOpen, setIsFloorPickerOpen] = useState(false);
  const [pendingFloorScope, setPendingFloorScope] = useState<FloorScope>(
    FLOOR_SCOPE.ground,
  );
  const [pendingFloor, setPendingFloor] = useState("1");

  const floorScopeOptions = useMemo(
    () => [
      { value: FLOOR_SCOPE.ground, label: m.report_floor_ground() },
      {
        value: FLOOR_SCOPE.underground,
        label: m.report_floor_underground(),
      },
    ],
    [],
  );

  const floorOptions = useMemo(
    () =>
      Array.from({ length: 99 }, (_, index) => {
        const floor = index + 1;

        return {
          value: String(floor),
          label: `${floor}${m.report_floor_unit()}`,
        };
      }),
    [],
  );

  const floorPickerColumns = useMemo<PopupPickerColumn[]>(
    () => [
      {
        id: "scope",
        value: pendingFloorScope,
        options: floorScopeOptions,
        ariaLabel: m.report_floor_scope_aria(),
      },
      {
        id: "floor",
        value: pendingFloor,
        options: floorOptions,
        ariaLabel: m.report_floor_number_aria(),
      },
    ],
    [floorOptions, floorScopeOptions, pendingFloorScope, pendingFloor],
  );

  const floorLabel =
    isHasFloorSelected && floorNumber !== null && floorType
      ? floorType === "UNDERGROUND"
        ? `B${floorNumber}${m.report_floor_unit()}`
        : `${floorNumber}${m.report_floor_unit()}`
      : m.report_floor_select_placeholder();

  const handleSelectNoFloor = () => {
    setValue("hasFloor", false, { shouldDirty: true });
    setValue("floorType", null, { shouldDirty: true });
    setValue("floorNumber", null, { shouldDirty: true });
    setIsFloorPickerOpen(false);
    onFieldChange?.();
  };

  const handleSelectHasFloor = () => {
    setValue("hasFloor", true, { shouldDirty: true });
    onFieldChange?.();
  };

  const handleOpenFloorPicker = () => {
    setPendingFloorScope(scopeFromFloorType(floorType));
    setPendingFloor(
      floorNumber !== null ? String(floorNumber) : pendingFloor,
    );
    setIsFloorPickerOpen(true);
  };

  const handleFloorPickerChange = (columnId: string, value: string) => {
    if (columnId === "scope") {
      setPendingFloorScope(normalizeFloorScope(value));
    }

    if (columnId === "floor") {
      setPendingFloor(value);
    }
  };

  const handleConfirmFloor = () => {
    const parsedFloor = Number.parseInt(pendingFloor, 10);
    if (Number.isNaN(parsedFloor) || parsedFloor < 1) return;

    setValue("hasFloor", true, { shouldDirty: true });
    setValue(
      "floorType",
      pendingFloorScope === FLOOR_SCOPE.underground
        ? "UNDERGROUND"
        : "ABOVE_GROUND",
      { shouldDirty: true },
    );
    setValue("floorNumber", parsedFloor, { shouldDirty: true });
    onFieldChange?.();
  };

  return (
    <section
      className={section}
      data-section="floor"
      aria-describedby={errorId}
    >
      <LabelTitle size="small">
        {m.report_section_floor()}
        <span className={requiredMark}>*</span>
      </LabelTitle>
      <div className={placeType}>
        <div className={floorControlRow}>
          <Button
            className={floorChoiceButton}
            variant={isNoFloorSelected ? "filled" : "outline"}
            intent={isNoFloorSelected ? "primary" : "neutral"}
            size="L"
            onPress={handleSelectNoFloor}
          >
            {m.report_floor_none()}
          </Button>
          <Button
            className={floorChoiceButton}
            variant={isHasFloorSelected ? "filled" : "outline"}
            intent={isHasFloorSelected ? "primary" : "neutral"}
            size="L"
            onPress={handleSelectHasFloor}
          >
            {m.report_floor_exists()}
          </Button>
          <PickerTriggerButton
            label={floorLabel}
            ariaLabel={m.report_floor_select_aria()}
            onPress={handleOpenFloorPicker}
            isDisabled={!isHasFloorSelected}
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

      <ReportSectionError id={errorId} message={errorMessage} />
    </section>
  );
}
