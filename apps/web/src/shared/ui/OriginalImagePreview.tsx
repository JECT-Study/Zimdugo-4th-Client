import {
  IconChevronLeft13,
  IconImageUnavailable24,
  IconX24,
} from "@repo/ui/tokens/icons";
import {
  type MouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  closeButton,
  counter,
  dialog,
  failureBox,
  image,
  navButton,
  nextButton,
  nextIcon,
  overlay,
  prevButton,
} from "./OriginalImagePreview.css";

export interface OriginalImagePreviewProps {
  /** 한 장만 볼 때도 배열로 넘긴다. */
  images: string[];
  initialIndex?: number;
  alt: string;
  closeLabel: string;
  /** 두 장 이상일 때만 쓴다. 없으면 좌우 버튼을 그리지 않고 스와이프·방향키만 남는다. */
  navigationLabels?: { previous: string; next: string };
  /** 사진을 못 불러왔을 때 자리에 띄울 문구. */
  loadFailedLabel?: string;
  portalContainer?: Element | null;
  onClose: () => void;
}

/** 이 거리 이상 가로로 밀어야 다음 장으로 넘어간다. */
const SWIPE_THRESHOLD_PX = 48;

export function OriginalImagePreview({
  images,
  initialIndex = 0,
  alt,
  closeLabel,
  navigationLabels,
  loadFailedLabel,
  portalContainer,
  onClose,
}: OriginalImagePreviewProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [index, setIndex] = useState(initialIndex);

  const totalCount = images.length;
  const activeIndex = Math.min(index, Math.max(totalCount - 1, 0));
  const currentImage = images[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < totalCount - 1;
  // 실패해도 목록에서 빼지 않는다. 자리를 지켜야 위치와 카운터가 흔들리지 않는다.
  const hasCurrentFailed = currentImage ? failedUrls.has(currentImage) : false;

  const goPrevious = () => {
    setIndex((current) => Math.max(current - 1, 0));
  };

  const goNext = () => {
    setIndex((current) => Math.min(current + 1, totalCount - 1));
  };

  const handlePreviousClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    goPrevious();
  };

  const handleNextClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    goNext();
  };

  const handleImageError = () => {
    if (!currentImage) {
      return;
    }

    setFailedUrls((current) =>
      current.has(currentImage) ? current : new Set(current).add(currentImage),
    );
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;

    const endX = event.changedTouches[0]?.clientX;
    if (startX == null || endX == null) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }

    if (deltaX > 0) {
      goPrevious();
      return;
    }

    goNext();
  };

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
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => Math.min(current + 1, totalCount - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose, totalCount]);

  if (typeof document === "undefined" || !currentImage) {
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasCurrentFailed ? (
          <span className={failureBox}>
            <IconImageUnavailable24 />
            {loadFailedLabel ? <span>{loadFailedLabel}</span> : null}
          </span>
        ) : (
          <img
            className={image}
            src={currentImage}
            alt={alt}
            onError={handleImageError}
          />
        )}
        <button
          ref={closeButtonRef}
          type="button"
          className={closeButton}
          onClick={handleCloseClick}
          aria-label={closeLabel}
        >
          <IconX24 />
        </button>
        {totalCount > 1 ? (
          <span className={counter}>
            {activeIndex + 1} / {totalCount}
          </span>
        ) : null}
        {totalCount > 1 && navigationLabels ? (
          <>
            <button
              type="button"
              className={[navButton, prevButton].join(" ")}
              onClick={handlePreviousClick}
              disabled={!hasPrevious}
              aria-label={navigationLabels.previous}
            >
              <IconChevronLeft13 />
            </button>
            <button
              type="button"
              className={[navButton, nextButton].join(" ")}
              onClick={handleNextClick}
              disabled={!hasNext}
              aria-label={navigationLabels.next}
            >
              <IconChevronLeft13 className={nextIcon} />
            </button>
          </>
        ) : null}
      </div>
    </div>,
    portalContainer ?? document.body,
  );
}
