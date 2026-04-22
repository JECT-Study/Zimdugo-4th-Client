import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { chip } from "./Chip.css.ts";

type ChipRecipeProps = NonNullable<Parameters<typeof chip>[0]>;

export interface ChipProps extends Omit<AriaButtonProps, "className"> {
  variant?: ChipRecipeProps["variant"];
  size?: ChipRecipeProps["size"];
  isSelected?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function Chip({
  variant = "default",
  size = "medium",
  isSelected,
  isDisabled,
  className,
  children,
  "aria-pressed": ariaPressedProp,
  ...props
}: ChipProps) {
  const ariaPressed = isSelected ?? ariaPressedProp;

  return (
    <AriaButton
      className={[chip({ variant, size }), className].filter(Boolean).join(" ")}
      aria-pressed={ariaPressed}
      isDisabled={isDisabled}
      {...props}
    >
      {children}
    </AriaButton>
  );
}
