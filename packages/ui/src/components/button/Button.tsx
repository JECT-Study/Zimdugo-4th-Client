import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { button, loadingDots, dot } from "./Button.css.ts";

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
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  const defaultLabel = typeof children === "string" ? children : "요청 처리";
  const resolvedAriaLabel = isLoading
    ? (ariaLabel ? `${ariaLabel} 중...` : `${defaultLabel} 중...`)
    : ariaLabel;

  return (
    <AriaButton
      className={[button({ variant, intent, size }), className]
        .filter(Boolean)
        .join(" ")}
      isDisabled={isDisabled || isLoading}
      aria-busy={isLoading}
      aria-label={resolvedAriaLabel}
      {...props}
    >
      {isLoading ? (
        <span className={loadingDots}>
          <span className={dot} style={{ animationDelay: "0s" }} />
          <span className={dot} style={{ animationDelay: "0.15s" }} />
          <span className={dot} style={{ animationDelay: "0.3s" }} />
        </span>
      ) : (
        children
      )}
    </AriaButton>
  );
}
