import type { ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { IconSnackbarClose12 } from "../../assets/icons/Icons.tsx";
import { action, closeButton, message, snackbar } from "./Snackbar.css.ts";

export type SnackbarVariant = "light" | "dark";

export interface SnackbarProps {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  closeAriaLabel: string;
  variant?: SnackbarVariant;
  className?: string;
}

export function Snackbar({
  children,
  actionLabel,
  onAction,
  onClose,
  closeAriaLabel,
  variant = "light",
  className,
}: SnackbarProps) {
  return (
    <div
      className={[snackbar({ variant }), className].filter(Boolean).join(" ")}
      aria-live="polite"
    >
      <span className={message}>{children}</span>
      {actionLabel ? (
        <AriaButton className={action({ variant })} onPress={onAction}>
          {actionLabel}
        </AriaButton>
      ) : null}
      <AriaButton
        className={closeButton({ variant })}
        aria-label={closeAriaLabel}
        onPress={onClose}
      >
        <IconSnackbarClose12 />
      </AriaButton>
    </div>
  );
}
