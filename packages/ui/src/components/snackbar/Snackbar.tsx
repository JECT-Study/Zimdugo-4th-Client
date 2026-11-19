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
    >
      {/*
        내용과 함께 처음 그려지는 영역이라 aria-live 만으로는 읽히지 않는 경우가
        많다. status 역할(output)은 삽입되는 순간에도 알리는 화면 낭독기가 많다.
        버튼 이름까지 함께 읽히지 않도록 문구에만 둔다.
      */}
      <output className={message}>{children}</output>
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
