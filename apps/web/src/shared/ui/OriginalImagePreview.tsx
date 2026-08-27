import { IconChevronLeft13, IconX24 } from "@repo/ui/tokens/icons";
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
  /** 로드에 실패한 URL을 알린다. 부모가 목록에서 빼면 여기서도 함께 사라진다. */
  onImageError?: (imageUrl: string) => void;
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
  onImageError,
  portalContainer,
  onClose,
}: OriginalImagePreviewProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  /**
   * 보고 있는 사진을 위치가 아니라 URL로 기억한다.
   *
   * 위치로 들면, 스트립에서 앞선 사진이 뒤늦게 실패해 목록이 줄어들 때 같은
   * 위치가 다음 사진을 가리키게 되어 사용자가 아무것도 안 했는데 화면이 넘어간다.
   */
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    () => images[initialIndex] ?? images[0],
  );

  // 스트립과 같은 규칙이다. 열어 본 이미지가 깨지면 목록에서 빼고 이웃으로 옮긴다.
  const visibleImages = images.filter((imageUrl) => !failedUrls.has(imageUrl));
  const totalCount = visibleImages.length;
  const selectedIndex = selectedImage
    ? visibleImages.indexOf(selectedImage)
    : -1;
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const currentImage = visibleImages[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < totalCount - 1;

  const goPrevious = () => {
    if (hasPrevious) {
      setSelectedImage(visibleImages[activeIndex - 1]);
    }
  };

  const goNext = () => {
    if (hasNext) {
      setSelectedImage(visibleImages[activeIndex + 1]);
    }
  };

  // 방향키 리스너가 매 렌더 다시 붙지 않도록 최신 이동 함수만 갈아 끼운다.
  const navigateRef = useRef({ goPrevious, goNext });
  navigateRef.current = { goPrevious, goNext };

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

    const remainingImages = visibleImages.filter(
      (imageUrl) => imageUrl !== currentImage,
    );

    setFailedUrls((current) =>
      current.has(currentImage) ? current : new Set(current).add(currentImage),
    );
    setSelectedImage(
      remainingImages[Math.min(activeIndex, remainingImages.length - 1)],
    );
    onImageError?.(currentImage);
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
        navigateRef.current.goPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateRef.current.goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  // 마지막 한 장까지 깨지면 볼 게 없다. 빈 모달을 남기지 않고 닫는다.
  useEffect(() => {
    if (totalCount === 0) {
      onClose();
    }
  }, [totalCount, onClose]);

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
        <img
          className={image}
          src={currentImage}
          alt={alt}
          onError={handleImageError}
        />
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
