import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { button } from "./Button.css.ts";

type ButtonVariant = "filled" | "outline" | "ghost";
type ButtonIntent = "primary" | "neutral";
type ButtonSize = "S" | "L";

interface ButtonProps extends Omit<AriaButtonProps, "className"> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  className?: string;
  isLoading?: boolean;
}

export function Button({
  variant = "filled",
  intent = "primary",
  size = "L",
  className,
  children,
  isLoading,
  isDisabled,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={[button({ variant, intent, size }), className]
        .filter(Boolean)
        .join(" ")}
      isDisabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading ? "..." : children}
    </AriaButton>
  );
}
