import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import {
  IconCamera24,
  IconCaution24,
  IconChevronLeft13,
  IconLockerDetailCapacity24,
  IconLockerDetailMapPin24,
  IconLockerDetailWallet24,
  IconShare24,
  IconStarFilled24,
  IconStarOutline24,
  IconX24,
} from "@repo/ui/tokens/icons";
import { type ReactNode, useEffect, useState } from "react";
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
  lockerImage,
  lockerImageButton,
  lockerTitle,
  metaDot,
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
} from "./LockerDetailBottomSheet.css.ts";

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

const DETAIL_MIN_TOP_OFFSET = 60;
const DETAIL_FULL_VISIBLE_HEIGHT = 780;
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

export const resolveLockerDetailSnapPoints = ({
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
}: ResolveLockerDetailSnapPointsOptions) => {
  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - DETAIL_DISMISS_VISIBLE_HEIGHT;
  const resolvedMinSnapPoint =
    minSnapPoint ??
    resolveLockerDetailSnapOffset({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: DETAIL_MIN_TOP_OFFSET,
      visibleHeight: DETAIL_FULL_VISIBLE_HEIGHT,
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

  const favoriteLabel = locker.isFavorite
    ? m.search_favorite_remove()
    : m.search_favorite_add();
  const detailHelpText = locker.detailHelpText ?? m.locker_detail_detail_help();
  const handleFavoritePress = () => {
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
    onSnapChange?.(nextSnap);
    onSnapStageChange?.(
      resolveLockerDetailSnapStage({
        maxSnapPoint: resolvedMaxSnapPoint,
        miniSnapPoint: resolvedMiniSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: nextSnap,
        snapPoint: resolvedSnapPoint,
      }),
    );
  };

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        {loadState === "error" ? (
          <LockerDetailErrorContent onBack={handleBack} onRetry={onRetry} />
        ) : (
          <FullDetailContent
            locker={locker}
            detailHelpText={detailHelpText}
            favoriteLabel={favoriteLabel}
            onFavoritePress={handleFavoritePress}
            onClose={handleBack}
            onShare={handleShare}
            onNavigate={handleNavigate}
            onVoteChange={onVoteChange}
          />
        )}
      </div>
    </DraggableBottomSheet>
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
  onFavoritePress,
  onClose,
  onShare,
  onNavigate,
  onVoteChange,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  favoriteLabel: string;
  onFavoritePress: () => void;
  onClose: () => void;
  onShare: () => void;
  onNavigate: () => void;
  onVoteChange?: (item: LockerDetailItem, voteType: LockerVoteType) => void;
}) {
  const hasFeedbackVotes =
    locker.accurateCount !== undefined || locker.inaccurateCount !== undefined;
  const canVote = typeof onVoteChange === "function";
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
    <div className={fullContentScroll}>
      <div className={contentStack}>
        <SummarySection
          locker={locker}
          favoriteLabel={favoriteLabel}
          onFavoritePress={onFavoritePress}
          onClose={onClose}
        />
        <div className={fullDetailList}>
          <DetailInfoRow
            icon={<IconLockerDetailMapPin24 />}
            title={locker.address}
            description={locker.floorLabel}
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
        {hasFeedbackVotes ? (
          <div className={feedbackActionSection}>
            <div className={feedbackRow}>
              {locker.accurateCount !== undefined ? (
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
                    count: String(locker.accurateCount),
                  })}
                </button>
              ) : null}
              {locker.inaccurateCount !== undefined ? (
                <button
                  type="button"
                  disabled={!canVote}
                  aria-disabled={!canVote}
                  className={[
                    feedbackButton,
                    feedbackButtonNegative,
                    locker.isInaccurateVoted
                      ? feedbackButtonNegativeSelected
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={locker.isInaccurateVoted === true}
                  onClick={() => handleVotePress("INCORRECT")}
                >
                  {m.locker_detail_feedback_inaccurate({
                    count: String(locker.inaccurateCount),
                  })}
                </button>
              ) : null}
            </div>
            <div className={actionDivider} />
            <ActionRow isFull onShare={onShare} onNavigate={onNavigate} />
          </div>
        ) : (
          <ActionRow isFull onShare={onShare} onNavigate={onNavigate} />
        )}
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
  onFavoritePress,
  onClose,
}: {
  locker: LockerDetailItem;
  favoriteLabel: string;
  onFavoritePress: () => void;
  onClose: () => void;
}) {
  return (
    <section
      className={summarySection}
      aria-label={m.locker_detail_summary_aria()}
    >
      <div className={summaryRow}>
        <div className={summaryTextColumn}>
          <h2 className={lockerTitle}>{locker.title}</h2>
          <InlineMeta
            left={locker.categoryLabel}
            right={
              locker.operatingHoursLabel ?? formatLockerOperatingHoursLabel()
            }
          />
          <InlineMeta
            className={distanceRow}
            left={locker.distanceLabel}
            right={<span className={addressText}>{locker.address}</span>}
          />
        </div>

        <div className={summaryActions}>
          <button
            type="button"
            className={favoriteButton}
            onClick={onFavoritePress}
            aria-label={favoriteLabel}
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
  descriptionClassName,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  trailing?: [string, string];
  iconTone?: "brand" | "neutral";
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
            <span className={detailTitle}>{title}</span>
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
