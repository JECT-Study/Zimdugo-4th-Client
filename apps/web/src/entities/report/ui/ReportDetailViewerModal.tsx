import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { LockerImageReportFrame } from "#/entities/locker/ui/image-report-frame";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import { useViewportHeight } from "#/shared/hooks/useViewportHeight";
import { DraggableBottomSheet } from "#/shared/ui/DraggableBottomSheet";
import { OriginalImagePreview } from "#/shared/ui/OriginalImagePreview";
import { OverflowMarqueeText } from "#/shared/ui/OverflowMarqueeText";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { formatReportViewerInformationGroups } from "../lib/format-report-viewer-sections";
import { resolveReportStatusDisplay } from "../lib/resolve-report-status";
import {
  closeButton,
  footer,
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
  const viewportHeight = useViewportHeight();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const imagePreviewTriggerRef = useRef<HTMLButtonElement | null>(null);
  /**
   * 시트가 사실상 닫힌 자리. 뷰포트 바닥에서 살짝 띄운다.
   *
   * 예전에는 창을 직접 읽어 effect 로 채웠다. 첫 렌더 값(760)이 실제와 달라
   * 브라우저가 그 자리로 한 번 그린 뒤 옮겨졌다. 훅은 그리기 전에 재므로
   * 그 프레임이 없다.
   */
  const collapsedSnap = Math.max(
    DEFAULT_SNAP_POINT,
    viewportHeight - COLLAPSED_BOTTOM_GAP,
  );
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
    if (!isOpen) {
      setPreviewImageUrl(null);
    }
  }, [isOpen]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={overlay}
      isDismissable
    >
      <Modal ref={modalRef} className={className}>
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
                  <h2 className={informationLockerTitle}>
                    <OverflowMarqueeText text={titleText} />
                  </h2>
                </div>
                {statusDisplay ? (
                  <ReportStatusBadge
                    status={statusDisplay.variant}
                    label={statusDisplay.label}
                  />
                ) : null}
              </div>

              {loadState === "loading" ? <ReportDetailViewerSkeleton /> : null}
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
                      <img className={photoImage} src={detailImageUrl} alt="" />
                    </button>
                  ) : (
                    <LockerImageReportFrame
                      size="half"
                      className={[photoPlaceholder, informationPhoto].join(" ")}
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
                            <dt className={informationLabel}>{field.label}</dt>
                            <dd className={informationValue}>{field.value}</dd>
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
          <OriginalImagePreview
            images={[previewImageUrl]}
            alt={m.report_section_photo()}
            closeLabel={m.my_report_detail_close()}
            portalContainer={modalRef.current}
            onClose={handleCloseImagePreview}
          />
        ) : null}
      </Modal>
    </ModalOverlay>
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
