import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { IconNormalArrow24 } from "../../tokens/icons/Icons.tsx";
import { controlChip, controlChipLabel } from "./ControlChip.css.ts";

type ControlChipVariant = "choice" | "filter" | "sort";
type ControlChipSize = "small" | "medium";
type SortDirection = "none" | "asc" | "desc";

export interface ControlChipProps
  extends Omit<AriaButtonProps, "className" | "children"> {
  label: string;
  variant?: ControlChipVariant;
  size?: ControlChipSize;
  isActive?: boolean;
  isOpen?: boolean;
  sortDirection?: SortDirection;
  className?: string;
}

export function ControlChip({
  label,
  variant = "choice",
  size = "medium",
  isActive = false,
  isOpen = false,
  sortDirection = "none",
  className,
  ...props
}: ControlChipProps) {
  const isFilter = variant === "filter";
  const isSort = variant === "sort";
  const isVisuallyActive = isActive || (isSort && sortDirection !== "none");
  const shouldShowArrow = isFilter || (isSort && sortDirection !== "none");
  const shouldRotateArrow =
    (isFilter && isOpen) || (isSort && sortDirection === "asc");

  return (
    <AriaButton
      {...props}
      className={[controlChip({ variant, size }), className]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={variant === "choice" ? isVisuallyActive : undefined}
      data-active={isVisuallyActive}
    >
      <span className={controlChipLabel}>{label}</span>
      {shouldShowArrow ? (
        <span
          style={{
            transform: shouldRotateArrow ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconNormalArrow24
            size={16}
            direction="down"
            tone={isVisuallyActive ? "active" : "default"}
          />
        </span>
      ) : null}
    </AriaButton>
  );
}
