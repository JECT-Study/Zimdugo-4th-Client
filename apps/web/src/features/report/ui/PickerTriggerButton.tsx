import { Button } from "@repo/ui/components/button";
import { IconNormalArrow24 } from "@repo/ui/tokens/icons";
import type { ReactNode } from "react";
import {
  pickerTriggerButton,
  pickerTriggerButtonContent,
  pickerTriggerButtonLabel,
  pickerTriggerButtonSlot,
} from "./report.css.ts";

interface PickerTriggerButtonProps {
  label: ReactNode;
  ariaLabel: string;
  onPress: () => void;
  isDisabled?: boolean;
  className?: string;
}

export function PickerTriggerButton({
  label,
  ariaLabel,
  onPress,
  isDisabled,
  className,
}: PickerTriggerButtonProps) {
  return (
    <span
      className={[pickerTriggerButtonSlot, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled ? "true" : undefined}
    >
      <Button
        className={pickerTriggerButton}
        variant="outline"
        intent="neutral"
        size="L"
        onPress={onPress}
        isDisabled={isDisabled}
        aria-label={ariaLabel}
      >
        <span className={pickerTriggerButtonContent}>
          <span className={pickerTriggerButtonLabel}>{label}</span>
          <IconNormalArrow24 direction="down" size={16} />
        </span>
      </Button>
    </span>
  );
}
