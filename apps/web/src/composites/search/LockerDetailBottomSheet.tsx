import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import {
  IconCamera24,
  IconCaution24,
  IconChevronLeft13,
  IconLockerDetailHeader24,
  IconNormalCapacity24,
  IconNormalMapPin24,
  IconNormalWallet24,
  IconShare24,
  IconStarFilled24,
  IconStarOutline24,
} from "@repo/ui/tokens/icons";
import { type ReactNode, useEffect, useState } from "react";
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
  type BottomSheetLiveOffsetState,
  DraggableBottomSheet,
  resolveBottomSheetExpandedProgress,
} from "#/shared/ui/DraggableBottomSheet";
import {
  actionRow,
  addressText,
  backButton,
  backIcon,
  contentStack,
  detailDescription,
  detailDescriptionMultiline,
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
  feedbackButton,
  feedbackButtonNegative,
  feedbackButtonNegativeSelected,
  feedbackButtonSelected,
  feedbackRow,
  fullActionBar,
  fullActionRow,
  fullContentScroll,
  fullDetailList,
  fullIconActionButton,
  fullImageReportCard,
  fullPrimaryActionButton,
  fullSheetColumn,
  helperText,
  iconActionButton,
  imageReportCard,
  imageReportText,
  lockerTitle,
  metaDot,
  metaRow,
  primaryActionButton,
  recentUpdatedText,
  sheetColumn,
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
  onSnapChange?: (nextSnap: number) => void;
}

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
  title: "…",
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
  onSnapChange,
}: LockerDetailBottomSheetProps) {
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 812,
  );
  const resolvedSnapPoint = snapPoint ?? Math.max(44, windowHeight - 380);
  const resolvedInitialSnapPoint = initialSnapPoint ?? resolvedSnapPoint;
  const resolvedMinSnapPoint = minSnapPoint ?? 44;
  const resolvedMaxSnapPoint = maxSnapPoint ?? windowHeight - 52;
  const resolvedMiniSnapPoint =
    resolvedSnapPoint + (resolvedMaxSnapPoint - resolvedSnapPoint) / 2;
  const [currentSnapPoint, setCurrentSnapPoint] = useState(
    resolvedInitialSnapPoint,
  );
  const [expandedProgress, setExpandedProgress] = useState(() =>
    resolveBottomSheetExpandedProgress({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: resolvedInitialSnapPoint,
    }),
  );

  const favoriteLabel = locker.isFavorite
    ? m.search_favorite_remove()
    : m.search_favorite_add();
  const detailHelpText = locker.detailHelpText ?? m.locker_detail_detail_help();
  const isFull =
    currentSnapPoint <= resolvedMinSnapPoint + 24 || expandedProgress >= 0.92;

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
    setCurrentSnapPoint(nextSnap);
    onSnapChange?.(nextSnap);
  };

  const handleLiveOffsetChange = ({
    expandedProgress,
  }: BottomSheetLiveOffsetState) => {
    setExpandedProgress(expandedProgress);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: lockerId changes must reset snap state even when numeric snap points stay equal.
  useEffect(() => {
    setCurrentSnapPoint(resolvedInitialSnapPoint);
    setExpandedProgress(
      resolveBottomSheetExpandedProgress({
        maxSnapPoint: resolvedMaxSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
      }),
    );
  }, [
    locker.lockerId,
    resolvedInitialSnapPoint,
    resolvedMaxSnapPoint,
    resolvedMinSnapPoint,
  ]);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DraggableBottomSheet
      key={`${locker.lockerId}-${resolvedInitialSnapPoint}`}
      snapPoint={resolvedSnapPoint}
      initialSnapPoint={initialSnapPoint}
      minSnapPoint={resolvedMinSnapPoint}
      miniSnapPoint={resolvedMiniSnapPoint}
      maxSnapPoint={resolvedMaxSnapPoint}
      onSnapChange={handleSnapChange}
      onLiveOffsetChange={handleLiveOffsetChange}
      onDismiss={handleBack}
    >
      <div
        className={[sheetColumn, isFull ? fullSheetColumn : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {loadState === "error" ? (
          <LockerDetailErrorContent onBack={handleBack} onRetry={onRetry} />
        ) : isFull ? (
          <FullDetailContent
            locker={locker}
            detailHelpText={detailHelpText}
            onShare={handleShare}
            onNavigate={handleNavigate}
            onVoteChange={onVoteChange}
          />
        ) : (
          <HalfDetailContent
            locker={locker}
            detailHelpText={detailHelpText}
            favoriteLabel={favoriteLabel}
            onFavoritePress={handleFavoritePress}
            onBack={handleBack}
            onShare={handleShare}
            onNavigate={handleNavigate}
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
      <div className={summaryRow}>
        <DetailBackButton onBack={onBack} />
      </div>
      <SearchAsyncFeedback variant="result-error" onRetry={onRetry} />
    </div>
  );
}

function HalfDetailContent({
  locker,
  detailHelpText,
  favoriteLabel,
  onFavoritePress,
  onBack,
  onShare,
  onNavigate,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  favoriteLabel: string;
  onFavoritePress: () => void;
  onBack: () => void;
  onShare: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className={contentStack}>
      <SummarySection
        locker={locker}
        detailHelpText={detailHelpText}
        favoriteLabel={favoriteLabel}
        onFavoritePress={onFavoritePress}
        leadingBack={<DetailBackButton onBack={onBack} />}
      />
      <ImageReportCard />
      <ActionRow onShare={onShare} onNavigate={onNavigate} />
    </div>
  );
}

function FullDetailContent({
  locker,
  detailHelpText,
  onShare,
  onNavigate,
  onVoteChange,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  onShare: () => void;
  onNavigate: () => void;
  onVoteChange?: (item: LockerDetailItem, voteType: LockerVoteType) => void;
}) {
  const hasFeedbackVotes =
    locker.accurateCount !== undefined || locker.inaccurateCount !== undefined;
  const canVote = typeof onVoteChange === "function";

  const handleVotePress = (voteType: LockerVoteType) => {
    if (!canVote) {
      return;
    }

    onVoteChange(locker, voteType);
  };

  return (
    <>
      <div className={fullContentScroll}>
        <div className={contentStack}>
          <ImageReportCard isFull />
          <div className={fullDetailList}>
            <DetailInfoRow
              icon={<IconLockerDetailHeader24 />}
              title={locker.title}
              description={
                locker.operatingHoursLabel ?? formatLockerOperatingHoursLabel()
              }
              trailing={[locker.categoryLabel, locker.distanceLabel]}
            />
            <DetailInfoRow
              icon={<IconNormalMapPin24 state="active" />}
              title={locker.address}
              description={locker.floorLabel}
            />
            <DetailInfoRow
              icon={<IconNormalWallet24 />}
              title={m.locker_detail_price_section()}
              description={locker.priceLabel ?? formatLockerPriceLabel()}
              iconTone="neutral"
            />
            {locker.sizeLabel ? (
              <DetailInfoRow
                icon={<IconNormalCapacity24 />}
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
          {hasFeedbackVotes ? (
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
          ) : null}
          {locker.lastUpdatedLabel ? (
            <p className={recentUpdatedText}>{locker.lastUpdatedLabel}</p>
          ) : null}
        </div>
      </div>
      <div className={fullActionBar}>
        <ActionRow isFull onShare={onShare} onNavigate={onNavigate} />
      </div>
    </>
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
  detailHelpText,
  favoriteLabel,
  onFavoritePress,
  leadingBack,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  favoriteLabel: string;
  onFavoritePress: () => void;
  leadingBack?: ReactNode;
}) {
  return (
    <section
      className={summarySection}
      aria-label={m.locker_detail_summary_aria()}
    >
      <div className={summaryRow}>
        {leadingBack}
        <div className={summaryTextColumn}>
          <h2 className={lockerTitle}>{locker.title}</h2>
          <InlineMeta left={locker.categoryLabel} right={locker.updatedLabel} />
          <InlineMeta
            className={distanceRow}
            left={locker.distanceLabel}
            right={<span className={addressText}>{locker.address}</span>}
          />
        </div>

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
      </div>
      <div className={divider} />
      <p className={helperText}>{detailHelpText}</p>
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

function ImageReportCard({ isFull = false }: { isFull?: boolean }) {
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
