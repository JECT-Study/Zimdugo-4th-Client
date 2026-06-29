import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { IconX24 } from "@repo/ui/tokens/icons";
import {
  type MouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { LockerImageReportFrame } from "#/entities/locker/ui/image-report-frame";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import { DraggableBottomSheet } from "#/shared/ui/DraggableBottomSheet";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { formatReportViewerInformationGroups } from "../lib/format-report-viewer-sections";
import { resolveReportStatusDisplay } from "../lib/resolve-report-status";
import {
  closeButton,
  footer,
  imagePreviewCloseButton,
  imagePreviewDialog,
  imagePreviewImage,
  imagePreviewOverlay,
  informationBody,
  informationEyebrow,
  informationGroup,
  informationGroupTitle,
  informationLabel,
  informationList,
  informationLockerTitle,
  informationPhoto,
  informationRow,
  informationTitleCopy,
  informationTitleRow,
  informationValue,
  overlay,
  panel,
  photoButton,
  photoImage,
  photoPlaceholder,
  skeletonBlock,
  skeletonContent,
  skeletonGroup,
  skeletonHeader,
  skeletonRows,
  stateMessage,
} from "./ReportDetailViewerModal.css.ts";
import { ReportStatusBadge } from "./ReportStatusBadge";

export type ReportDetailViewerLoadState =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export interface ReportDetailViewerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  titleText: string;
  detail: MyLockerReportDetail | null;
  loadState: ReportDetailViewerLoadState;
  className?: string;
}

const DEFAULT_SNAP_POINT = 52;
const COLLAPSED_BOTTOM_GAP = 24;
const SKELETON_GROUP_KEYS = ["location", "locker"] as const;
const SKELETON_ROW_KEYS = ["primary", "secondary", "tertiary"] as const;

export function ReportDetailViewerModal({
  isOpen,
  onOpenChange,
  titleText,
  detail,
  loadState,
  className,
}: ReportDetailViewerModalProps) {
  const [collapsedSnap, setCollapsedSnap] = useState(760);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const imagePreviewTriggerRef = useRef<HTMLButtonElement | null>(null);
  const informationGroups =
    detail != null && loadState === "ready"
      ? formatReportViewerInformationGroups(detail)
      : [];
  const statusDisplay =
    loadState === "ready" && detail?.reportStatus != null
      ? resolveReportStatusDisplay(detail.reportStatus)
      : null;
  const detailImageUrl = detail?.imageUrl ?? null;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleOpenImagePreview = (
    imageUrl: string,
    triggerElement: HTMLButtonElement,
  ) => {
    imagePreviewTriggerRef.current = triggerElement;
    setPreviewImageUrl(imageUrl);
  };

  const handleCloseImagePreview = useCallback(() => {
    setPreviewImageUrl(null);
    imagePreviewTriggerRef.current?.focus();
    imagePreviewTriggerRef.current = null;
  }, []);

  useEffect(() => {
    const updateCollapsedSnap = () => {
      setCollapsedSnap(
        Math.max(DEFAULT_SNAP_POINT, window.innerHeight - COLLAPSED_BOTTOM_GAP),
      );
    };
    updateCollapsedSnap();
    window.addEventListener("resize", updateCollapsedSnap);
    return () => window.removeEventListener("resize", updateCollapsedSnap);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPreviewImageUrl(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!previewImageUrl) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleCloseImagePreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [previewImageUrl, handleCloseImagePreview]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={overlay}
      isDismissable
    >
      <Modal className={className}>
        <>
          <DraggableBottomSheet
            snapPoint={DEFAULT_SNAP_POINT}
            initialSnapPoint={DEFAULT_SNAP_POINT}
            minSnapPoint={DEFAULT_SNAP_POINT}
            maxSnapPoint={collapsedSnap}
            dismissSnapPoint={collapsedSnap}
            animateOnMount
            onDismiss={handleClose}
          >
            <Dialog
              className={panel}
              aria-label={m.my_report_detail_viewer_aria()}
            >
              <div className={informationBody}>
                <div
                  className={informationTitleRow}
                  data-slot="information-title"
                >
                  <div className={informationTitleCopy}>
                    <span className={informationEyebrow}>
                      {m.my_report_detail_eyebrow()}
                    </span>
                    <h2 className={informationLockerTitle}>{titleText}</h2>
                  </div>
                  {statusDisplay ? (
                    <ReportStatusBadge
                      status={statusDisplay.variant}
                      label={statusDisplay.label}
                    />
                  ) : null}
                </div>

                {loadState === "loading" ? (
                  <ReportDetailViewerSkeleton />
                ) : null}
                {loadState === "error" ? (
                  <p className={stateMessage}>{m.my_list_error_title()}</p>
                ) : null}
                {loadState === "ready" && detail == null ? (
                  <p className={stateMessage}>{m.my_list_error_title()}</p>
                ) : null}

                {loadState === "ready" && detail != null ? (
                  <>
                    {detailImageUrl ? (
                      <button
                        type="button"
                        className={[photoButton, informationPhoto].join(" ")}
                        onClick={(event) =>
                          handleOpenImagePreview(
                            detailImageUrl,
                            event.currentTarget,
                          )
                        }
                        aria-label={m.report_section_photo()}
                      >
                        <img
                          className={photoImage}
                          src={detailImageUrl}
                          alt=""
                        />
                      </button>
                    ) : (
                      <LockerImageReportFrame
                        size="half"
                        titleText={m.my_report_image_empty()}
                        helperText=""
                        className={[photoPlaceholder, informationPhoto].join(
                          " ",
                        )}
                      />
                    )}

                    {informationGroups.map((group) => (
                      <section
                        key={group.title}
                        className={informationGroup}
                        aria-label={group.title}
                      >
                        <h3 className={informationGroupTitle}>{group.title}</h3>
                        <dl className={informationList}>
                          {group.fields.map((field) => (
                            <div key={field.label} className={informationRow}>
                              <dt className={informationLabel}>
                                {field.label}
                              </dt>
                              <dd className={informationValue}>
                                {field.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ))}
                  </>
                ) : null}
              </div>

              {loadState === "ready" && detail != null ? (
                <div className={footer}>
                  <Button
                    className={closeButton}
                    variant="filled"
                    intent="neutral"
                    size="L"
                    onPress={handleClose}
                  >
                    {m.my_report_detail_close()}
                  </Button>
                </div>
              ) : null}
            </Dialog>
          </DraggableBottomSheet>
          {previewImageUrl ? (
            <ImagePreviewOverlay
              imageUrl={previewImageUrl}
              onClose={handleCloseImagePreview}
            />
          ) : null}
        </>
      </Modal>
    </ModalOverlay>
  );
}

function ImagePreviewOverlay({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

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

  return (
    <div className={imagePreviewOverlay}>
      <div
        ref={dialogRef}
        className={imagePreviewDialog}
        role="dialog"
        aria-modal="true"
        aria-label={m.report_section_photo()}
        onClick={handleDialogClick}
        onKeyDown={handleDialogKeyDown}
      >
        <img
          className={imagePreviewImage}
          src={imageUrl}
          alt={m.report_section_photo()}
        />
        <button
          ref={closeButtonRef}
          type="button"
          className={imagePreviewCloseButton}
          onClick={handleCloseClick}
          aria-label={m.my_report_detail_close()}
        >
          <IconX24 />
        </button>
      </div>
    </div>
  );
}

function ReportDetailViewerSkeleton() {
  return (
    <output className={skeletonContent} aria-label={m.my_summary_loading()}>
      <div className={skeletonHeader}>
        <Skeleton
          className={skeletonBlock}
          height={180}
          borderRadius={8}
          style={SKELETON_SURFACE_STYLE}
        />
      </div>

      {SKELETON_GROUP_KEYS.map((groupKey) => (
        <div className={skeletonGroup} key={groupKey}>
          <Skeleton
            width={96}
            height={18}
            borderRadius={6}
            style={SKELETON_SURFACE_STYLE}
          />
          <div className={skeletonRows}>
            {SKELETON_ROW_KEYS.map((rowKey) => (
              <Skeleton
                key={rowKey}
                className={skeletonBlock}
                height={42}
                borderRadius={6}
                style={SKELETON_SURFACE_STYLE}
              />
            ))}
          </div>
        </div>
      ))}
    </output>
  );
}
