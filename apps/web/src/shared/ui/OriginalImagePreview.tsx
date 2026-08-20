import { IconX24 } from "@repo/ui/tokens/icons";
import {
  type MouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  closeButton,
  dialog,
  image,
  overlay,
} from "./OriginalImagePreview.css";

export interface OriginalImagePreviewProps {
  imageUrl: string;
  alt: string;
  closeLabel: string;
  onClose: () => void;
}

export function OriginalImagePreview({
  imageUrl,
  alt,
  closeLabel,
  onClose,
}: OriginalImagePreviewProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute("disabled"));

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClose();
  };

  const handleDialogClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={overlay}>
      <div
        ref={dialogRef}
        className={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        onClick={handleDialogClick}
        onKeyDown={handleDialogKeyDown}
      >
        <img className={image} src={imageUrl} alt={alt} />
        <button
          ref={closeButtonRef}
          type="button"
          className={closeButton}
          onClick={handleCloseClick}
          aria-label={closeLabel}
        >
          <IconX24 />
        </button>
      </div>
    </div>,
    document.body,
  );
}
