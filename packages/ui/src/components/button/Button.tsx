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
}

export function Button({
  variant = "filled",
  intent = "primary",
  size = "L",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={[button({ variant, intent, size }), className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </AriaButton>
  );
}
