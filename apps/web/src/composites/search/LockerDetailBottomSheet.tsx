import { Button } from "@repo/ui/components/button";
import {
  IconCamera24,
  IconCaution24,
  IconNavigationClock24,
  IconNormalMapPin24,
  IconShare24,
  IconStarFilled24,
  IconStarOutline24,
  IconThumbnail24,
} from "@repo/ui/tokens/icons";
import { type ReactNode, useEffect, useState } from "react";
import type { SearchLockerResultItem } from "#/composites/search/search-list-model";
import type { SearchAutocompleteItemData } from "#/entities/search";
import { DraggableBottomSheet } from "#/shared/ui/DraggableBottomSheet";
import {
  actionRow,
  addressText,
  contentStack,
  detailDescription,
  detailIcon,
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
  lastUpdatedLabel?: string;
}

export interface LockerDetailBottomSheetProps {
  locker: LockerDetailItem;
  onFavoriteChange?: (item: LockerDetailItem, next: boolean) => void;
  onShare?: (item: LockerDetailItem) => void;
  onNavigate?: (item: LockerDetailItem) => void;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  onSnapChange?: (nextSnap: number) => void;
}

export const createLockerDetailFromSearchItem = (
  item: SearchLockerResultItem,
): LockerDetailItem => ({
  ...item,
  operatingHoursLabel: item.operatingHours
    ? `운영시간 ${item.operatingHours.open} ~ ${item.operatingHours.close}`
    : "운영시간 00:00 ~ 00:00",
  floorLabel: "B2층",
  priceLabel: item.minPrice
    ? `${item.minPrice.toLocaleString("ko-KR")}원 ~`
    : "000원 ~ 000원",
  sizeLabel: "S / M / L / 기타",
  detailHelpText: "물품보관함의 상세 위치 및 추가 요금 정보를 알려주세요.",
  accurateCount: 78,
  inaccurateCount: 5,
  lastUpdatedLabel: "최근 업데이트 2026-05-16 16:25",
});

export const createLockerDetailFromAutocompleteItem = (
  item: SearchAutocompleteItemData,
): LockerDetailItem => ({
  suggestType: "LOCKER",
  id: item.id,
  title: item.title,
  address: item.address,
  categoryLabel: item.categoryLabel,
  updatedLabel: item.updatedLabel,
  distanceLabel: item.distanceLabel,
  operatingHoursLabel: "운영시간 00:00 ~ 00:00",
  floorLabel: "B2층",
  priceLabel: "000원 ~ 000원",
  sizeLabel: "S / M / L / 기타",
  detailHelpText: "물품보관함의 상세 위치 및 추가 요금 정보를 알려주세요.",
  accurateCount: 78,
  inaccurateCount: 5,
  lastUpdatedLabel: "최근 업데이트 2026-05-16 16:25",
});

export function LockerDetailBottomSheet({
  locker,
  onFavoriteChange,
  onShare,
  onNavigate,
  minSnapPoint,
  snapPoint,
  maxSnapPoint,
  onSnapChange,
}: LockerDetailBottomSheetProps) {
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 812,
  );
  const resolvedSnapPoint = snapPoint ?? Math.max(44, windowHeight - 380);
  const resolvedMinSnapPoint = minSnapPoint ?? 44;
  const resolvedMaxSnapPoint = maxSnapPoint ?? windowHeight - 52;
  const [currentSnapPoint, setCurrentSnapPoint] = useState(resolvedSnapPoint);

  const favoriteLabel = locker.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가";
  const detailHelpText =
    locker.detailHelpText ??
    "물품보관함의 상세 위치 및 추가 요금 정보를 알려주세요.";
  const isFull = currentSnapPoint <= resolvedMinSnapPoint + 24;

  const handleFavoritePress = () => {
    onFavoriteChange?.(locker, !locker.isFavorite);
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

  useEffect(() => {
    setCurrentSnapPoint(resolvedSnapPoint);
  }, [resolvedSnapPoint]);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DraggableBottomSheet
      snapPoint={resolvedSnapPoint}
      minSnapPoint={resolvedMinSnapPoint}
      maxSnapPoint={resolvedMaxSnapPoint}
      onSnapChange={handleSnapChange}
    >
      <div
        className={[sheetColumn, isFull ? fullSheetColumn : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {isFull ? (
          <FullDetailContent
            locker={locker}
            detailHelpText={detailHelpText}
            onShare={handleShare}
            onNavigate={handleNavigate}
          />
        ) : (
          <HalfDetailContent
            locker={locker}
            detailHelpText={detailHelpText}
            favoriteLabel={favoriteLabel}
            onFavoritePress={handleFavoritePress}
            onShare={handleShare}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </DraggableBottomSheet>
  );
}

function HalfDetailContent({
  locker,
  detailHelpText,
  favoriteLabel,
  onFavoritePress,
  onShare,
  onNavigate,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  favoriteLabel: string;
  onFavoritePress: () => void;
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
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  onShare: () => void;
  onNavigate: () => void;
}) {
  const accurateCount = locker.accurateCount ?? 78;
  const inaccurateCount = locker.inaccurateCount ?? 5;

  return (
    <>
      <div className={fullContentScroll}>
        <div className={contentStack}>
          <ImageReportCard isFull />
          <div className={fullDetailList}>
            <DetailInfoRow
              icon={<IconThumbnail24 />}
              title={locker.title}
              description={
                locker.operatingHoursLabel ?? "운영시간 00:00 ~ 00:00"
              }
              trailing={[locker.categoryLabel, locker.distanceLabel]}
            />
            <DetailInfoRow
              icon={<IconNormalMapPin24 state="active" />}
              title={locker.address}
              description={locker.floorLabel ?? "B2층"}
            />
            <DetailInfoRow
              icon={<IconShare24 />}
              title="가격"
              description={locker.priceLabel ?? "000원 ~ 000원"}
            />
            <DetailInfoRow
              icon={<IconNavigationClock24 />}
              title="사이즈"
              description={locker.sizeLabel ?? "S / M / L / 기타"}
            />
            <DetailInfoRow
              icon={<IconCaution24 />}
              title="보관함 상세 정보"
              description={detailHelpText}
            />
          </div>
          <div className={feedbackRow}>
            <button type="button" className={feedbackButton}>
              정확한 정보에요 {accurateCount}
            </button>
            <button
              type="button"
              className={[feedbackButton, feedbackButtonNegative].join(" ")}
            >
              부정확한 정보에요 {inaccurateCount}
            </button>
          </div>
          <p className={recentUpdatedText}>
            {locker.lastUpdatedLabel ?? "최근 업데이트 2026-05-16 16:25"}
          </p>
        </div>
      </div>
      <div className={fullActionBar}>
        <ActionRow isFull onShare={onShare} onNavigate={onNavigate} />
      </div>
    </>
  );
}

function SummarySection({
  locker,
  detailHelpText,
  favoriteLabel,
  onFavoritePress,
}: {
  locker: LockerDetailItem;
  detailHelpText: string;
  favoriteLabel: string;
  onFavoritePress: () => void;
}) {
  return (
    <section className={summarySection} aria-label="보관함 요약 정보">
      <div className={summaryRow}>
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
}: {
  icon: ReactNode;
  title: string;
  description: string;
  trailing?: [string, string];
}) {
  return (
    <div className={detailItem}>
      <div className={detailItemContent}>
        <div className={detailLeading}>
          <span className={detailIcon} aria-hidden="true">
            {icon}
          </span>
          <div className={detailTextColumn}>
            <span className={detailTitle}>{title}</span>
            <span className={detailDescription}>{description}</span>
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
        aria-label="공유하기"
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
        길찾기
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
  return (
    <div className={[metaRow, className].filter(Boolean).join(" ")}>
      {left}
      <span className={metaDot} aria-hidden="true" />
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
        <span>아직 이미지가 없어요.</span>
        <span>제보하기를 통해 등록할 수 있어요!</span>
      </div>
    </div>
  );
}
