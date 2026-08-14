import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import {
  IconCamera24,
  IconCaution24,
  IconChevronLeft13,
  IconCircleboxClose32,
  IconCircleboxMore32,
  IconDistanceRoute24,
  IconLockerDetailCapacity24,
  IconLockerDetailMapPin24,
  IconLockerDetailWallet24,
  IconNavigationClock24,
  IconX24,
} from "@repo/ui/tokens/icons";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type {
  LockerDetailItem,
  LockerDetailLoadState,
} from "#/entities/locker/model/locker-detail";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import {
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
} from "#/shared/lib/locker-detail-labels";
import {
  type BottomSheetSnapRequest,
  DraggableBottomSheet,
} from "#/shared/ui/DraggableBottomSheet";
import { OverflowMarqueeText } from "#/shared/ui/OverflowMarqueeText";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  actionDivider,
  actionRow,
  actionSection,
  backButton,
  backIcon,
  contentStack,
  detailDescription,
  detailDescriptionMultiline,
  detailHeader,
  detailIcon,
  detailIconNeutral,
  detailItem,
  detailItemContent,
  detailLeading,
  detailTextColumn,
  detailTitle,
  detailTitleMultiline,
  detailTrailing,
  distanceRow,
  fullActionRow,
  fullContentScroll,
  fullContentScrollEnabled,
  fullDetailList,
  fullImageReportCard,
  fullLockerImage,
  fullPrimaryActionButton,
  imagePreviewCloseButton,
  imagePreviewDialog,
  imagePreviewImage,
  imagePreviewOverlay,
  imageReportCard,
  imageReportText,
  loadingActionRow,
  loadingContent,
  loadingDetailList,
  loadingDetailRow,
  loadingSummary,
  loadingTextStack,
  lockerImage,
  lockerImageButton,
  lockerTitle,
  lockerTitleExpanded,
  metaDot,
  metaIcon,
  metaIconText,
  metaRow,
  metaTruncatedText,
  primaryActionButton,
  recentUpdatedText,
  sheetColumn,
  summaryActions,
  summaryDivider,
  summaryIconButton,
  summaryRow,
  summarySection,
  summaryTextColumn,
  titleControlRow,
  titleExpandButton,
  titleExpandIcon,
  titleExpandIconExpanded,
} from "./LockerDetailBottomSheet.css.ts";
import { LockerDetailMoreActionsModal } from "./LockerDetailMoreActionsModal";

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;
const LOCKER_DETAIL_SKELETON_ROWS = ["address", "price", "size", "info"];

export interface LockerDetailBottomSheetProps {
  locker: LockerDetailItem;
  loadState?: LockerDetailLoadState;
  onRetry?: () => void;
  onFavoriteChange?: (item: LockerDetailItem, next: boolean) => void;
  onBack?: () => void;
  onShare?: (item: LockerDetailItem) => void;
  onReport?: (item: LockerDetailItem) => void;
  onNavigate?: (item: LockerDetailItem) => void;
  isFavoriteActionVisible?: boolean;
  minSnapPoint?: number;
  snapPoint?: number;
  /** 풀 스냅으로 열 때만 지정. 하프 스냅은 snapPoint에 유지 */
  initialSnapPoint?: number;
  maxSnapPoint?: number;
  animateOnMount?: boolean;
  onSnapChange?: (nextSnap: number) => void;
  onSnapStageChange?: (nextStage: LockerDetailSheetSnapStage) => void;
  snapRequest?: LockerDetailSheetSnapRequest | null;
}

export const LOCKER_DETAIL_FULL_TOP_OFFSET = 112;
const DETAIL_CONTENT_TOP_PADDING = 8;
const DETAIL_CONTENT_BOTTOM_PADDING = 24;
const DETAIL_DISMISS_VISIBLE_HEIGHT = 52;
const DETAIL_MINI_VISIBLE_HEIGHT = 111;
const DETAIL_HALF_VISIBLE_HEIGHT = 246;
const DETAIL_DRAG_SENSITIVITY = 1.2;

export type LockerDetailSheetSnapStage = "full" | "half" | "mini" | "dismiss";

export interface LockerDetailSheetSnapRequest {
  id: number;
  stage: LockerDetailSheetSnapStage;
}

interface ResolveLockerDetailSnapPointsOptions {
  windowHeight: number;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  fullContentHeight?: number | null;
}

export const resolveLockerDetailSnapOffset = ({
  maxSnapPoint,
  minSnapPoint,
  visibleHeight,
  windowHeight,
}: {
  maxSnapPoint: number;
  minSnapPoint: number;
  visibleHeight: number;
  windowHeight: number;
}) =>
  Math.min(maxSnapPoint, Math.max(minSnapPoint, windowHeight - visibleHeight));

export const resolveLockerDetailSnapStage = ({
  maxSnapPoint,
  miniSnapPoint,
  minSnapPoint,
  offset,
  snapPoint,
}: {
  maxSnapPoint: number;
  miniSnapPoint: number;
  minSnapPoint: number;
  offset: number;
  snapPoint: number;
}): LockerDetailSheetSnapStage => {
  const entries = [
    { stage: "full" as const, point: minSnapPoint },
    { stage: "half" as const, point: snapPoint },
    { stage: "mini" as const, point: miniSnapPoint },
    { stage: "dismiss" as const, point: maxSnapPoint },
  ];

  return entries.reduce((nearestEntry, entry) =>
    Math.abs(entry.point - offset) < Math.abs(nearestEntry.point - offset)
      ? entry
      : nearestEntry,
  ).stage;
};

export const resolveLockerDetailFullSnapPoint = ({
  contentHeight,
  maxSnapPoint,
  minSnapPoint,
  windowHeight,
}: {
  contentHeight?: number | null;
  maxSnapPoint: number;
  minSnapPoint: number;
  windowHeight: number;
}) => {
  if (!contentHeight || contentHeight <= 0) {
    return minSnapPoint;
  }

  return Math.min(
    maxSnapPoint,
    Math.max(minSnapPoint, windowHeight - contentHeight),
  );
};

export const resolveLockerDetailSnapPoints = ({
  fullContentHeight,
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
}: ResolveLockerDetailSnapPointsOptions) => {
  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - DETAIL_DISMISS_VISIBLE_HEIGHT;
  const resolvedFullTopOffset = minSnapPoint ?? LOCKER_DETAIL_FULL_TOP_OFFSET;
  const resolvedMinSnapPoint = resolveLockerDetailFullSnapPoint({
    contentHeight: fullContentHeight,
    maxSnapPoint: resolvedMaxSnapPoint,
    minSnapPoint: resolvedFullTopOffset,
    windowHeight,
  });
  const resolvedSnapPoint =
    snapPoint ??
    resolveLockerDetailSnapOffset({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      visibleHeight: DETAIL_HALF_VISIBLE_HEIGHT,
      windowHeight,
    });
  const resolvedMiniSnapPoint = resolveLockerDetailSnapOffset({
    maxSnapPoint: resolvedMaxSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    visibleHeight: DETAIL_MINI_VISIBLE_HEIGHT,
    windowHeight,
  });

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

export function LockerDetailBottomSheet({
  locker,
  loadState = "ready",
  onRetry,
  onFavoriteChange,
  onBack,
  onShare,
  onReport,
  onNavigate,
  isFavoriteActionVisible = true,
  minSnapPoint,
  snapPoint,
  initialSnapPoint,
  maxSnapPoint,
  animateOnMount = false,
  onSnapChange,
  onSnapStageChange,
  snapRequest,
}: LockerDetailBottomSheetProps) {
  const [windowHeight, setWindowHeight] = useState(812);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [fullContentHeight, setFullContentHeight] = useState<number | null>(
    null,
  );
  const fullContentMeasureRef = useRef<HTMLDivElement | null>(null);
  const moreActionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const updateFullContentHeight = useCallback(() => {
    const element = fullContentMeasureRef.current;

    if (!element) {
      setFullContentHeight(null);
      return;
    }

    setFullContentHeight(
      Math.ceil(
        element.scrollHeight +
          DETAIL_CONTENT_TOP_PADDING +
          DETAIL_CONTENT_BOTTOM_PADDING,
      ),
    );
  }, []);
  const handleFullContentMeasureRef = useCallback(
    (element: HTMLDivElement | null) => {
      fullContentMeasureRef.current = element;
      updateFullContentHeight();
    },
    [updateFullContentHeight],
  );
  const {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  } = resolveLockerDetailSnapPoints({
    maxSnapPoint,
    minSnapPoint,
    snapPoint,
    windowHeight,
    fullContentHeight,
  });
  const resolvedInitialSnapPoint =
    initialSnapPoint !== undefined
      ? Math.min(
          resolvedMaxSnapPoint,
          Math.max(resolvedMinSnapPoint, initialSnapPoint),
        )
      : resolvedSnapPoint;
  const resolvedSnapRequest: BottomSheetSnapRequest | null = snapRequest
    ? {
        id: snapRequest.id,
        snapPoint:
          snapRequest.stage === "full"
            ? resolvedMinSnapPoint
            : snapRequest.stage === "half"
              ? resolvedSnapPoint
              : snapRequest.stage === "mini"
                ? resolvedMiniSnapPoint
                : resolvedMaxSnapPoint,
      }
    : null;
  const [currentSnapStage, setCurrentSnapStage] =
    useState<LockerDetailSheetSnapStage>(() =>
      resolveLockerDetailSnapStage({
        maxSnapPoint: resolvedMaxSnapPoint,
        miniSnapPoint: resolvedMiniSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
        snapPoint: resolvedSnapPoint,
      }),
    );
  const initialSnapPointRef = useRef(resolvedInitialSnapPoint);

  const detailHelpText = locker.detailHelpText ?? m.locker_detail_detail_help();
  const canFavorite =
    isFavoriteActionVisible && typeof onFavoriteChange === "function";

  const handleFavoritePress = () => {
    if (!canFavorite) {
      return;
    }

    onFavoriteChange?.(locker, !locker.isFavorite);
  };

  const handleBack = () => {
    onBack?.();
  };

  const handleShare = () => {
    onShare?.(locker);
  };

  const handleReport = () => {
    onReport?.(locker);
  };

  const handleNavigate = () => {
    onNavigate?.(locker);
  };

  const handleOpenMoreActions = () => {
    setIsMoreActionsOpen(true);
  };

  const handleSnapChange = (nextSnap: number) => {
    const nextStage = resolveLockerDetailSnapStage({
      maxSnapPoint: resolvedMaxSnapPoint,
      miniSnapPoint: resolvedMiniSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: nextSnap,
      snapPoint: resolvedSnapPoint,
    });

    setCurrentSnapStage(nextStage);
    onSnapChange?.(nextSnap);
    onSnapStageChange?.(nextStage);
  };

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (loadState !== "ready") {
      setFullContentHeight(null);
      return;
    }

    updateFullContentHeight();
    const element = fullContentMeasureRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateFullContentHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [loadState, updateFullContentHeight]);

  useEffect(() => {
    if (initialSnapPointRef.current === resolvedInitialSnapPoint) {
      return;
    }

    initialSnapPointRef.current = resolvedInitialSnapPoint;
    setCurrentSnapStage(
      resolveLockerDetailSnapStage({
        maxSnapPoint: resolvedMaxSnapPoint,
        miniSnapPoint: resolvedMiniSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
        snapPoint: resolvedSnapPoint,
      }),
    );
  }, [
    resolvedInitialSnapPoint,
    resolvedMaxSnapPoint,
    resolvedMiniSnapPoint,
    resolvedMinSnapPoint,
    resolvedSnapPoint,
  ]);

  return (
    <>
      <DraggableBottomSheet
        key={`${locker.lockerId}-${resolvedInitialSnapPoint}`}
        snapPoint={resolvedSnapPoint}
        initialSnapPoint={resolvedInitialSnapPoint}
        minSnapPoint={resolvedMinSnapPoint}
        miniSnapPoint={resolvedMiniSnapPoint}
        maxSnapPoint={resolvedMaxSnapPoint}
        dragSensitivity={DETAIL_DRAG_SENSITIVITY}
        animateOnMount={animateOnMount}
        showHomeIndicator={false}
        snapRequest={resolvedSnapRequest}
        onSnapChange={handleSnapChange}
        onDismiss={handleBack}
      >
        <div className={sheetColumn}>
          {loadState === "loading" ? (
            <LockerDetailLoadingContent />
          ) : loadState === "error" ? (
            <LockerDetailErrorContent onBack={handleBack} onRetry={onRetry} />
          ) : (
            <FullDetailContent
              locker={locker}
              detailHelpText={detailHelpText}
              onClose={handleBack}
              onMoreActionsOpen={handleOpenMoreActions}
              moreActionsButtonRef={moreActionsButtonRef}
              onNavigate={handleNavigate}
              snapStage={currentSnapStage}
              isScrollEnabled={currentSnapStage === "full"}
              contentRef={handleFullContentMeasureRef}
            />
          )}
        </div>
      </DraggableBottomSheet>
      <LockerDetailMoreActionsModal
        isOpen={isMoreActionsOpen}
        onOpenChange={setIsMoreActionsOpen}
        anchorRef={moreActionsButtonRef}
        isFavorite={locker.isFavorite === true}
        canFavorite={canFavorite}
        onShare={handleShare}
        onFavoriteChange={handleFavoritePress}
        onReport={handleReport}
      />
    </>
  );
}

function LockerDetailLoadingContent() {
  return (
    <output
      className={loadingContent}
      aria-live="polite"
      aria-label={m.search_result_loading_aria()}
    >
      <div className={loadingSummary}>
        <div className={loadingTextStack}>
          <Skeleton
            width="72%"
            height={18}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
          <Skeleton
            width="54%"
            height={14}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
          <Skeleton
            width="86%"
            height={14}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
        </div>
        <Skeleton
          width={32}
          height={32}
          borderRadius={16}
          style={skeletonSurfaceStyle}
        />
      </div>
      <div className={loadingDetailList}>
        {LOCKER_DETAIL_SKELETON_ROWS.map((rowKey) => (
          <div key={rowKey} className={loadingDetailRow}>
            <Skeleton
              width={24}
              height={24}
              borderRadius={6}
              style={skeletonSurfaceStyle}
            />
            <div className={loadingTextStack}>
              <Skeleton
                width="70%"
                height={15}
                borderRadius={6}
                style={skeletonSurfaceStyle}
              />
              <Skeleton
                width="48%"
                height={13}
                borderRadius={6}
                style={skeletonSurfaceStyle}
              />
            </div>
          </div>
        ))}
      </div>
      <Skeleton
        width="100%"
        height={160}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
      <div className={loadingActionRow}>
        <Skeleton
          width={56}
          height={40}
          borderRadius={8}
          style={skeletonSurfaceStyle}
        />
        <Skeleton
          width="100%"
          height={40}
          borderRadius={8}
          style={skeletonSurfaceStyle}
        />
      </div>
    </output>
  );
}

function LockerDetailErrorContent({
  onBack,
  onRetry,
}: {
  onBack: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className={contentStack}>
      <div className={detailHeader}>
        <DetailBackButton onBack={onBack} />
      </div>
      <SearchAsyncFeedback variant="result-error" onRetry={onRetry} />
    </div>
  );
}

function FullDetailContent({
  locker,
  detailHelpText,
  onClose,
  onMoreActionsOpen,
  moreActionsButtonRef,
  onNavigate,
  snapStage,
  isScrollEnabled,
  contentRef,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  onClose: () => void;
  onMoreActionsOpen: () => void;
  moreActionsButtonRef: RefObject<HTMLButtonElement | null>;
  onNavigate: () => void;
  snapStage: LockerDetailSheetSnapStage;
  isScrollEnabled: boolean;
  contentRef?: (element: HTMLDivElement | null) => void;
}) {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const handleOpenImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
  };

  const handleCloseImagePreview = () => {
    setPreviewImageUrl(null);
  };

  useEffect(() => {
    if (!previewImageUrl) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImageUrl(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImageUrl]);

  return (
    <div
      className={[
        fullContentScroll,
        isScrollEnabled ? fullContentScrollEnabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-scroll-enabled={isScrollEnabled ? "true" : "false"}
    >
      <div ref={contentRef} className={contentStack}>
        <SummarySection
          locker={locker}
          onClose={onClose}
          onMoreActionsOpen={onMoreActionsOpen}
          moreActionsButtonRef={moreActionsButtonRef}
          snapStage={snapStage}
          canExpandTitle={isScrollEnabled}
        />
        <div className={fullDetailList}>
          <DetailInfoRow
            icon={<IconLockerDetailMapPin24 />}
            title={locker.address}
            description={locker.floorLabel}
            titleClassName={detailTitleMultiline}
          />
          <DetailInfoRow
            icon={<IconLockerDetailWallet24 />}
            title={m.locker_detail_price_section()}
            description={locker.priceLabel ?? formatLockerPriceLabel()}
            iconTone="neutral"
          />
          {locker.sizeLabel ? (
            <DetailInfoRow
              icon={<IconLockerDetailCapacity24 />}
              title={m.locker_detail_size_section()}
              description={locker.sizeLabel}
              iconTone="neutral"
            />
          ) : null}
          <DetailInfoRow
            icon={<IconCaution24 />}
            title={m.locker_detail_info_section()}
            description={detailHelpText}
            iconTone="neutral"
            descriptionClassName={detailDescriptionMultiline}
          />
        </div>
        <ImageReportCard
          isFull
          imageUrl={locker.imageUrl}
          onOpenPreview={handleOpenImagePreview}
        />
        {locker.lastUpdatedLabel ? (
          <p className={recentUpdatedText}>{locker.lastUpdatedLabel}</p>
        ) : null}
        {/*
          @deprecated 정확성 vote UI는 상세 화면 개편에서 노출을 중단했다.
          롤백 시 features/vote의 훅·모델·API를 다시 연결하고,
          이 위치에 기존 액션 영역을 복원한다.
        */}
        <div className={actionSection}>
          <div className={actionDivider} />
          <ActionRow isFull onNavigate={onNavigate} />
        </div>
      </div>
      {previewImageUrl ? (
        <ImagePreviewOverlay
          imageUrl={previewImageUrl}
          onClose={handleCloseImagePreview}
        />
      ) : null}
    </div>
  );
}

function DetailBackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button
      variant="ghost"
      intent="neutral"
      size="S"
      className={backButton}
      onPress={onBack}
      aria-label={m.locker_detail_back_aria()}
    >
      <IconChevronLeft13 className={backIcon} />
    </Button>
  );
}

function SummarySection({
  locker,
  onClose,
  onMoreActionsOpen,
  moreActionsButtonRef,
  snapStage,
  canExpandTitle,
}: {
  locker: LockerDetailItem;
  onClose: () => void;
  onMoreActionsOpen: () => void;
  moreActionsButtonRef: RefObject<HTMLButtonElement | null>;
  snapStage: LockerDetailSheetSnapStage;
  canExpandTitle: boolean;
}) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

  const titleText = locker.title;
  const isMiniSnapStage = snapStage === "mini";
  const summaryTrailingText = isMiniSnapStage
    ? locker.address
    : locker.updatedLabel || locker.address;
  const summaryTrailingNode = isMiniSnapStage ? (
    <span className={metaTruncatedText}>{summaryTrailingText}</span>
  ) : (
    summaryTrailingText
  );
  const distanceText =
    locker.distanceLabel.trim() || m.locker_detail_distance_not_provided();
  const operatingHoursText =
    locker.operatingHoursLabel ?? formatLockerOperatingHoursLabel();
  const canShowTitleExpandButton =
    canExpandTitle && (isTitleOverflowing || isTitleExpanded);

  const handleTitleOverflowChange = useCallback(
    (nextIsOverflowing: boolean) => {
      setIsTitleOverflowing(nextIsOverflowing);
    },
    [],
  );

  const handleTitleExpandToggle = () => {
    setIsTitleExpanded((current) => !current);
  };

  useEffect(() => {
    if (titleText.length > 0) {
      setIsTitleExpanded(false);
      setIsTitleOverflowing(false);
    }
  }, [titleText]);

  useEffect(() => {
    if (!canExpandTitle) {
      setIsTitleExpanded(false);
    }
  }, [canExpandTitle]);

  return (
    <section
      className={summarySection}
      aria-label={m.locker_detail_summary_aria()}
    >
      <div className={summaryRow}>
        <div className={summaryTextColumn}>
          <div className={titleControlRow}>
            <h2
              className={[
                lockerTitle,
                isTitleExpanded ? lockerTitleExpanded : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isTitleExpanded ? (
                titleText
              ) : (
                <OverflowMarqueeText
                  text={titleText}
                  title={titleText}
                  onOverflowChange={handleTitleOverflowChange}
                />
              )}
            </h2>
            {canShowTitleExpandButton ? (
              <button
                type="button"
                className={titleExpandButton}
                onClick={handleTitleExpandToggle}
                aria-expanded={isTitleExpanded}
                aria-label={
                  isTitleExpanded
                    ? m.locker_detail_title_collapse_aria()
                    : m.locker_detail_title_expand_aria()
                }
              >
                <IconChevronLeft13
                  className={[
                    titleExpandIcon,
                    isTitleExpanded ? titleExpandIconExpanded : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </button>
            ) : null}
          </div>
          <InlineMeta
            className={distanceRow}
            left={
              <span className={metaIconText}>
                <IconDistanceRoute24 className={metaIcon} />
                {distanceText}
              </span>
            }
            right={
              <span className={metaIconText}>
                <IconNavigationClock24 className={metaIcon} />
                {operatingHoursText}
              </span>
            }
          />
          <InlineMeta left={locker.categoryLabel} right={summaryTrailingNode} />
        </div>

        <div className={summaryActions}>
          <button
            ref={moreActionsButtonRef}
            type="button"
            className={summaryIconButton}
            onClick={onMoreActionsOpen}
            aria-label={m.locker_detail_more_actions_open_aria()}
          >
            <IconCircleboxMore32 />
          </button>
          <button
            type="button"
            className={summaryIconButton}
            onClick={onClose}
            aria-label={m.search_close_aria()}
          >
            <IconCircleboxClose32 />
          </button>
        </div>
      </div>
      <div className={summaryDivider} />
    </section>
  );
}

function DetailInfoRow({
  icon,
  title,
  description,
  trailing,
  iconTone = "brand",
  titleClassName,
  descriptionClassName,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  trailing?: [string, string];
  iconTone?: "brand" | "neutral";
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  const iconClassName = [
    detailIcon,
    iconTone === "neutral" ? detailIconNeutral : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={detailItem}>
      <div className={detailItemContent}>
        <div className={detailLeading}>
          <span className={iconClassName} aria-hidden="true">
            {icon}
          </span>
          <div className={detailTextColumn}>
            <span
              className={[detailTitle, titleClassName]
                .filter(Boolean)
                .join(" ")}
            >
              {title}
            </span>
            {description ? (
              <span
                className={[detailDescription, descriptionClassName]
                  .filter(Boolean)
                  .join(" ")}
              >
                {description}
              </span>
            ) : null}
          </div>
        </div>
        {trailing ? (
          <div className={detailTrailing} aria-hidden="true">
            <span>{trailing[0]}</span>
            <span>{trailing[1]}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActionRow({
  isFull = false,
  onNavigate,
}: {
  isFull?: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className={isFull ? fullActionRow : actionRow}>
      <Button
        variant="filled"
        intent="primary"
        size={isFull ? "L" : "S"}
        className={[
          primaryActionButton,
          isFull ? fullPrimaryActionButton : "",
        ].join(" ")}
        onPress={onNavigate}
      >
        {m.locker_detail_navigate()}
      </Button>
    </div>
  );
}

function InlineMeta({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  const hasLeft =
    typeof left === "string" ? left.trim().length > 0 : left != null;
  const hasRight =
    typeof right === "string" ? right.trim().length > 0 : right != null;

  return (
    <div className={[metaRow, className].filter(Boolean).join(" ")}>
      {hasLeft ? left : null}
      {hasLeft && hasRight ? (
        <span className={metaDot} aria-hidden="true" />
      ) : null}
      {right}
    </div>
  );
}

function ImageReportCard({
  isFull = false,
  imageUrl,
  onOpenPreview,
}: {
  isFull?: boolean;
  imageUrl?: string;
  onOpenPreview?: (imageUrl: string) => void;
}) {
  if (imageUrl) {
    return (
      <button
        type="button"
        className={[lockerImageButton, isFull ? fullLockerImage : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onOpenPreview?.(imageUrl)}
        aria-label={m.report_section_photo()}
      >
        <img
          className={lockerImage}
          src={imageUrl}
          alt={m.report_section_photo()}
        />
      </button>
    );
  }

  return (
    <div
      className={[imageReportCard, isFull ? fullImageReportCard : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <IconCamera24 />
      <div className={imageReportText}>
        <span>{m.locker_detail_no_image_title()}</span>
        <span>{m.locker_detail_no_image_helper()}</span>
      </div>
    </div>
  );
}

function ImagePreviewOverlay({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={imagePreviewOverlay}>
      <div
        className={imagePreviewDialog}
        role="dialog"
        aria-modal="true"
        aria-label={m.report_section_photo()}
      >
        <img
          className={imagePreviewImage}
          src={imageUrl}
          alt={m.report_section_photo()}
        />
        <button
          type="button"
          className={imagePreviewCloseButton}
          onClick={onClose}
          aria-label={m.search_close_aria()}
        >
          <IconX24 />
        </button>
      </div>
    </div>,
    document.body,
  );
}
