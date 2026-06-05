import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { LabelTitle } from "@repo/ui/components/label-title";
import {
  PopupPicker,
  type PopupPickerColumn,
} from "@repo/ui/components/popup-picker";
import { useMemo, useState } from "react";
import { PickerTriggerButton } from "./PickerTriggerButton";
import {
  floorChoiceButton,
  floorControlRow,
  placeType,
  requiredMark,
  section,
} from "./report.css.ts";

interface ReportFloorSectionProps {
  floorType: string | number;
  setFloorType: (val: string | number) => void;
  setFloorNumber: (val: string) => void;
  dialPrefix: string;
  setDialPrefix: (val: string) => void;
  dialD1: string;
  setDialD1: (val: string) => void;
  dialD2: string;
  setDialD2: (val: string) => void;
  dialD3: string;
  setDialD3: (val: string) => void;
}

const FLOOR_SCOPE = {
  ground: "ground",
  underground: "underground",
} as const;

type FloorScope = (typeof FLOOR_SCOPE)[keyof typeof FLOOR_SCOPE];

const normalizeFloorScope = (value: string): FloorScope => {
  if (
    value === FLOOR_SCOPE.underground ||
    value === m.report_floor_underground() ||
    value === "\uC9C0\uD558"
  ) {
    return FLOOR_SCOPE.underground;
  }

  return FLOOR_SCOPE.ground;
};

const getFloorValue = (dialD1: string, dialD2: string, dialD3: string) => {
  const parsedFloor = Number.parseInt(`${dialD1}${dialD2}${dialD3}`, 10);

  return Number.isNaN(parsedFloor) || parsedFloor < 1
    ? "1"
    : String(Math.min(parsedFloor, 99));
};

const getFloorDigits = (floorValue: string) => {
  return floorValue.padStart(3, "0").slice(-3).split("");
};

export function ReportFloorSection({
  floorType,
  setFloorType,
  setFloorNumber,
  dialPrefix,
  setDialPrefix,
  dialD1,
  setDialD1,
  dialD2,
  setDialD2,
  dialD3,
  setDialD3,
}: ReportFloorSectionProps) {
  const normalizedDialPrefix = normalizeFloorScope(dialPrefix);
  const [isFloorPickerOpen, setIsFloorPickerOpen] = useState(false);
  const [pendingFloorScope, setPendingFloorScope] =
    useState<FloorScope>(normalizedDialPrefix);
  const [pendingFloor, setPendingFloor] = useState(
    getFloorValue(dialD1, dialD2, dialD3),
  );

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

  const selectedFloor = Number.parseInt(`${dialD1}${dialD2}${dialD3}`, 10);
  const floorLabel =
    floorType === "exists" && !Number.isNaN(selectedFloor)
      ? normalizedDialPrefix === FLOOR_SCOPE.underground
        ? `B${selectedFloor}`
        : `${selectedFloor}${m.report_floor_unit()}`
      : m.report_floor_select_placeholder();

  const handleSelectNoFloor = () => {
    setFloorType("none");
    setFloorNumber("");
    setIsFloorPickerOpen(false);
  };

  const handleSelectHasFloor = () => {
    setFloorType("exists");
  };

  const handleOpenFloorPicker = () => {
    setPendingFloorScope(normalizedDialPrefix);
    setPendingFloor(getFloorValue(dialD1, dialD2, dialD3));
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
    const [nextD1, nextD2, nextD3] = getFloorDigits(pendingFloor);
    const floorPrefix =
      pendingFloorScope === FLOOR_SCOPE.underground ? "B" : "";

    setFloorType("exists");
    setDialPrefix(pendingFloorScope);
    setDialD1(nextD1 ?? "0");
    setDialD2(nextD2 ?? "0");
    setDialD3(nextD3 ?? "1");
    setFloorNumber(`${floorPrefix}${pendingFloor}`);
  };

  return (
    <section className={section}>
      <LabelTitle size="small">
        {m.report_section_floor()}
        <span className={requiredMark}>*</span>
      </LabelTitle>
      <div className={placeType}>
        <div className={floorControlRow}>
          <Button
            className={floorChoiceButton}
            variant={floorType === "none" ? "filled" : "outline"}
            intent={floorType === "none" ? "primary" : "neutral"}
            size="L"
            onPress={handleSelectNoFloor}
          >
            {m.report_floor_none()}
          </Button>
          <Button
            className={floorChoiceButton}
            variant={floorType === "exists" ? "filled" : "outline"}
            intent={floorType === "exists" ? "primary" : "neutral"}
            size="L"
            onPress={handleSelectHasFloor}
          >
            {m.report_floor_exists()}
          </Button>
          <PickerTriggerButton
            label={floorLabel}
            ariaLabel={m.report_floor_select_aria()}
            onPress={handleOpenFloorPicker}
            isDisabled={floorType === "none"}
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
    </section>
  );
}
