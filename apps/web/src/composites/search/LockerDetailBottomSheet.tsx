import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import {
  IconCamera24,
  IconCaution24,
  IconChevronLeft13,
  IconLockerDetailCapacity24,
  IconLockerDetailMapPin24,
  IconLockerDetailWallet24,
  IconNavigationClock24,
  IconShare24,
  IconStarFilled24,
  IconStarOutline24,
  IconX24,
} from "@repo/ui/tokens/icons";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { SearchLockerResultItem } from "#/composites/search/search-list-model";
import type { SearchAutocompleteItemData } from "#/entities/search";
import type { SearchHistoryLockerEntry } from "#/features/search/model/search-history";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import type { LockerVoteType } from "#/shared/api/locker-votes";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
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
  addressText,
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
  divider,
  favoriteButton,
  feedbackActionSection,
  feedbackButton,
  feedbackButtonNegative,
  feedbackButtonNegativeSelected,
  feedbackButtonSelected,
  feedbackRow,
  fullActionRow,
  fullContentScroll,
  fullContentScrollEnabled,
  fullDetailList,
  fullIconActionButton,
  fullImageReportCard,
  fullLockerImage,
  fullPrimaryActionButton,
  iconActionButton,
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
  primaryActionButton,
  recentUpdatedText,
  sheetColumn,
  summaryActions,
  summaryCloseButton,
  summaryDivider,
  summaryRow,
  summarySection,
  summaryTextColumn,
  titleControlRow,
  titleExpandButton,
  titleExpandIcon,
  titleExpandIconExpanded,
} from "./LockerDetailBottomSheet.css.ts";

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;
const LOCKER_DETAIL_SKELETON_ROWS = ["address", "price", "size", "info"];

export interface LockerDetailItem extends SearchLockerResultItem {
  operatingHoursLabel?: string;
  floorLabel?: string;
  priceLabel?: string;
  sizeLabel?: string;
  detailHelpText?: string;
  accurateCount?: number;
  inaccurateCount?: number;
  isAccurateVoted?: boolean;
  isInaccurateVoted?: boolean;
  lastUpdatedLabel?: string;
  imageUrl?: string;
}

export type LockerDetailLoadState = "ready" | "loading" | "error";

export interface LockerDetailBottomSheetProps {
  locker: LockerDetailItem;
  loadState?: LockerDetailLoadState;
  onRetry?: () => void;
  onFavoriteChange?: (item: LockerDetailItem, next: boolean) => void;
  onVoteChange?: (item: LockerDetailItem, voteType: LockerVoteType) => void;
  onBack?: () => void;
  onShare?: (item: LockerDetailItem) => void;
  onNavigate?: (item: LockerDetailItem) => void;
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

export const createLockerDetailFromSearchItem = (
  item: SearchLockerResultItem,
): LockerDetailItem => ({
  ...item,
  operatingHoursLabel: item.operatingHours
    ? formatLockerOperatingHoursLabel(
        item.operatingHours.open,
        item.operatingHours.close,
      )
    : formatLockerOperatingHoursLabel(),
  priceLabel: formatLockerPriceLabel(item.minPrice),
});

/** 지도 핀 선택 직후 API 응답 전에 쓰는 낙관적 상세 */
export const createLockerDetailFromPin = (
  pin: Extract<LockerPinItemResponse, { pinType: "LOCKER" }>,
): LockerDetailItem => ({
  ...createLockerDetailPlaceholder(pin.lockerId),
  latitude: pin.latitude,
  longitude: pin.longitude,
});

/** API 응답 전 마커 등 lockerId만 알 때 쓰는 플레이스홀더 */
export const createLockerDetailPlaceholder = (
  lockerId: number,
): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId,
  title: "...",
  address: "",
  categoryLabel: "",
  updatedLabel: "",
  distanceLabel: "",
  operatingHoursLabel: formatLockerOperatingHoursLabel(),
  floorLabel: "",
  priceLabel: formatLockerPriceLabel(),
  sizeLabel: "",
  detailHelpText: "",
});

export const createLockerDetailFromHistoryEntry = (
  entry: Pick<SearchHistoryLockerEntry, "lockerId" | "title">,
): LockerDetailItem => ({
  ...createLockerDetailPlaceholder(entry.lockerId),
  title: entry.title,
});

export const createLockerDetailFromAutocompleteItem = (
  item: Extract<SearchAutocompleteItemData, { itemType: "LOCKER" }>,
): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId: item.lockerId,
  title: item.title,
  address: item.address,
  categoryLabel: item.categoryLabel,
  updatedLabel: item.updatedLabel,
  distanceLabel: item.distanceLabel,
  distanceMeters: item.distanceMeters,
  operatingHoursLabel: formatLockerOperatingHoursLabel(),
  priceLabel: formatLockerPriceLabel(),
});

export function LockerDetailBottomSheet({
  locker,
  loadState = "ready",
  onRetry,
  onFavoriteChange,
  onVoteChange,
  onBack,
  onShare,
  onNavigate,
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
  const [fullContentHeight, setFullContentHeight] = useState<number | null>(
    null,
  );
  const fullContentMeasureRef = useRef<HTMLDivElement | null>(null);
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

  const favoriteLabel = locker.isFavorite
    ? m.search_favorite_remove()
    : m.search_favorite_add();
  const detailHelpText = locker.detailHelpText ?? m.locker_detail_detail_help();
  const canFavorite = typeof onFavoriteChange === "function";

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

  const handleNavigate = () => {
    onNavigate?.(locker);
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
            favoriteLabel={favoriteLabel}
            canFavorite={canFavorite}
            onFavoritePress={handleFavoritePress}
            onClose={handleBack}
            onShare={handleShare}
            onNavigate={handleNavigate}
            onVoteChange={onVoteChange}
            snapStage={currentSnapStage}
            isScrollEnabled={currentSnapStage === "full"}
            contentRef={handleFullContentMeasureRef}
          />
        )}
      </div>
    </DraggableBottomSheet>
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
  favoriteLabel,
  canFavorite,
  onFavoritePress,
  onClose,
  onShare,
  onNavigate,
  onVoteChange,
  snapStage,
  isScrollEnabled,
  contentRef,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  favoriteLabel: string;
  canFavorite: boolean;
  onFavoritePress: () => void;
  onClose: () => void;
  onShare: () => void;
  onNavigate: () => void;
  onVoteChange?: (item: LockerDetailItem, voteType: LockerVoteType) => void;
  snapStage: LockerDetailSheetSnapStage;
  isScrollEnabled: boolean;
  contentRef?: (element: HTMLDivElement | null) => void;
}) {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const canVote = typeof onVoteChange === "function";
  const accurateCount = locker.accurateCount ?? 0;
  const inaccurateCount = locker.inaccurateCount ?? 0;

  const handleVotePress = (voteType: LockerVoteType) => {
    if (!canVote) {
      return;
    }

    onVoteChange(locker, voteType);
  };

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
          favoriteLabel={favoriteLabel}
          canFavorite={canFavorite}
          onFavoritePress={onFavoritePress}
          onClose={onClose}
          snapStage={snapStage}
        />
        <div className={fullDetailList}>
          <DetailInfoRow
            icon={<IconLockerDetailMapPin24 />}
            title={locker.address}
            description={locker.floorLabel}
            titleClassName={
              snapStage === "full" ? detailTitleMultiline : undefined
            }
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
        <div className={feedbackActionSection}>
          <div className={feedbackRow}>
            <button
              type="button"
              disabled={!canVote}
              aria-disabled={!canVote}
              className={[
                feedbackButton,
                locker.isAccurateVoted ? feedbackButtonSelected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={locker.isAccurateVoted === true}
              onClick={() => handleVotePress("CORRECT")}
            >
              {m.locker_detail_feedback_accurate({
                count: String(accurateCount),
              })}
            </button>
            <button
              type="button"
              disabled={!canVote}
              aria-disabled={!canVote}
              className={[
                feedbackButton,
                feedbackButtonNegative,
                locker.isInaccurateVoted ? feedbackButtonNegativeSelected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={locker.isInaccurateVoted === true}
              onClick={() => handleVotePress("INCORRECT")}
            >
              {m.locker_detail_feedback_inaccurate({
                count: String(inaccurateCount),
              })}
            </button>
          </div>
          <div className={actionDivider} />
          <ActionRow isFull onShare={onShare} onNavigate={onNavigate} />
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
  favoriteLabel,
  canFavorite,
  onFavoritePress,
  onClose,
  snapStage,
}: {
  locker: LockerDetailItem;
  favoriteLabel: string;
  canFavorite: boolean;
  onFavoritePress: () => void;
  onClose: () => void;
  snapStage: LockerDetailSheetSnapStage;
}) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

  const titleText = locker.title;
  const summaryTrailingText =
    snapStage === "mini"
      ? locker.address
      : locker.updatedLabel || locker.address;
  const isFullSnapStage = snapStage === "full";
  const shouldShowTitleExpandButton =
    isFullSnapStage && (isTitleOverflowing || isTitleExpanded);

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
    if (!isFullSnapStage) {
      setIsTitleExpanded(false);
    }
  }, [isFullSnapStage]);

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
                  onOverflowChange={handleTitleOverflowChange}
                />
              )}
            </h2>
            {shouldShowTitleExpandButton ? (
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
            left={locker.categoryLabel}
            right={
              <span className={metaIconText}>
                <IconNavigationClock24 className={metaIcon} />
                {locker.operatingHoursLabel ??
                  formatLockerOperatingHoursLabel()}
              </span>
            }
          />
          <InlineMeta
            className={distanceRow}
            left={locker.distanceLabel}
            right={<span className={addressText}>{summaryTrailingText}</span>}
          />
        </div>

        <div className={summaryActions}>
          <button
            type="button"
            className={favoriteButton}
            onClick={onFavoritePress}
            aria-label={favoriteLabel}
            disabled={!canFavorite}
            aria-disabled={!canFavorite}
          >
            {locker.isFavorite ? (
              <IconStarFilled24 size={24} />
            ) : (
              <IconStarOutline24 size={24} />
            )}
          </button>
          <button
            type="button"
            className={summaryCloseButton}
            onClick={onClose}
            aria-label={m.search_close_aria()}
          >
            <IconX24 />
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
      <div className={divider} />
    </div>
  );
}

function ActionRow({
  isFull = false,
  onShare,
  onNavigate,
}: {
  isFull?: boolean;
  onShare: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className={isFull ? fullActionRow : actionRow}>
      <Button
        variant="filled"
        intent="neutral"
        size={isFull ? "L" : "S"}
        className={[iconActionButton, isFull ? fullIconActionButton : ""].join(
          " ",
        )}
        onPress={onShare}
        aria-label={m.locker_detail_share_aria()}
      >
        <IconShare24 />
      </Button>
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
