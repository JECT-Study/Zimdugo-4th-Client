import { ControlChip } from "../control-chip/ControlChip.tsx";
import {
  controlChipGroupRoot,
  controlChipGroupRow,
} from "./ControlChipGroup.css.ts";

export interface ControlChipGroupOption {
  label: string;
  value: string;
}

export interface ControlChipGroupProps {
  options: ControlChipGroupOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  selectionMode?: "single" | "multiple";
  ariaLabel?: string;
  className?: string;
}

export function ControlChipGroup({
  options,
  value = [],
  onChange,
  selectionMode = "single",
  ariaLabel,
  className,
}: ControlChipGroupProps) {
  const handlePress = (nextValue: string) => {
    if (selectionMode === "single") {
      onChange?.([nextValue]);
      return;
    }

    onChange?.(
      value.includes(nextValue)
        ? value.filter((currentValue) => currentValue !== nextValue)
        : [...value, nextValue],
    );
  };
  const optionRows = Array.from(
    { length: Math.ceil(options.length / 4) },
    (_, index) => options.slice(index * 4, index * 4 + 4),
  );

  return (
    <fieldset
      className={[controlChipGroupRoot, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {optionRows.map((row) => (
        <div
          key={row.map((option) => option.value).join("-")}
          className={controlChipGroupRow}
        >
          {row.map((option) => (
            <ControlChip
              key={option.value}
              label={option.label}
              variant="choice"
              size="medium"
              isActive={value.includes(option.value)}
              onPress={() => handlePress(option.value)}
            />
          ))}
        </div>
      ))}
    </fieldset>
  );
}
