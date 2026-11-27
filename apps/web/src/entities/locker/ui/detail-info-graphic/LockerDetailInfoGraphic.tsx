import { m } from "@repo/i18n";
import {
  IconNavigationClock24,
  IconSizeL,
  IconSizeM,
  IconSizeS,
} from "@repo/ui/assets/icons";
import type {
  LockerDetailInfo,
  LockerSizeInfo,
  LockerSizeType,
} from "#/entities/locker/lib/parse-locker-detail-info";
import type { LockerRealtimeAvailability } from "#/entities/locker/model/locker-detail";
import { formatCurrencyAmount } from "#/shared/lib/locker-detail-labels";
import {
  basis,
  extraLines,
  gauge,
  gaugeFill,
  gaugeLabel,
  gaugeTrack,
  root,
  sizeCard,
  sizeCount,
  sizeGrid,
  sizeIconSlot,
  sizeName,
  sizePrice,
  visuallyHidden,
} from "./LockerDetailInfoGraphic.css.ts";

export interface LockerDetailInfoGraphicProps {
  info: LockerDetailInfo;
  /** 실시간 남은 칸. 있으면 크기 카드마다 남은 칸 / 전체 칸 게이지를 그린다. */
  realtimeAvailability?: LockerRealtimeAvailability | null;
}

const SIZE_ICONS = {
  SMALL: IconSizeS,
  MEDIUM: IconSizeM,
  LARGE: IconSizeL,
} as const;

const sizeNameOf = (size: LockerSizeType) =>
  size === "SMALL"
    ? m.report_size_s()
    : size === "MEDIUM"
      ? m.report_size_m()
      : m.report_size_l();

const availableCountOf = (
  size: LockerSizeType,
  availability: LockerRealtimeAvailability,
) =>
  size === "SMALL"
    ? availability.smallAvailableCount
    : size === "MEDIUM"
      ? availability.mediumAvailableCount
      : availability.largeAvailableCount;

/**
 * 보관함 상세 정보를 그림으로 보여 준다.
 *
 * 문장 세 줄(상세위치·개수·요금) 중 개수·요금을 크기별 칸 카드(그림·요금·개수)와
 * 요금 기준으로 펼친다. 상세위치는 보관함 이름이 대개 이미 담고 있어 따로 달지 않는다. 실시간 남은 칸이 있으면 카드마다 남은/전체 게이지를 단다.
 * 읽지 못한 줄은 원문 그대로 아래에 남긴다.
 */
export function LockerDetailInfoGraphic({
  info,
  realtimeAvailability,
}: LockerDetailInfoGraphicProps) {
  const availability = realtimeAvailability?.isAvailable
    ? realtimeAvailability
    : null;

  return (
    <section className={root} aria-label={m.locker_detail_info_section()}>
      {info.sizes.length > 0 ? (
        <ul className={sizeGrid}>
          {info.sizes.map((item) => (
            <SizeCardItem
              key={item.size}
              item={item}
              availableCount={
                availability
                  ? availableCountOf(item.size, availability)
                  : undefined
              }
            />
          ))}
        </ul>
      ) : null}

      {info.priceBasis ? (
        <p className={basis}>
          <IconNavigationClock24 />
          {info.priceBasis}
        </p>
      ) : null}

      {info.unparsedLines.length > 0 ? (
        <ul className={extraLines}>
          {info.unparsedLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function SizeCardItem({
  item,
  availableCount,
}: {
  item: LockerSizeInfo;
  availableCount?: number;
}) {
  const Icon = SIZE_ICONS[item.size];
  const total = item.count;
  const isEmpty = total === 0;
  const hasGauge =
    availableCount !== undefined && total !== undefined && total > 0;
  const ratio = hasGauge ? Math.min(1, availableCount / total) : 0;
  /*
   * 칸이 있는 크기는 초록으로 둔다. 실시간 정보가 남은 칸이 없다고 알려 줄 때만
   * 회색(마감)으로, 칸이 아예 없는 크기는 흐리게 둔다. 실시간 정보가 없는 보관함이
   * 더 많아, 남은 칸이 확인될 때만 초록으로 두면 대부분 회색이라 비활성처럼 보인다.
   */
  const iconState = isEmpty
    ? "disabled"
    : availableCount === 0
      ? "default"
      : "selected";

  return (
    <li className={sizeCard} data-empty={isEmpty ? "true" : undefined}>
      <span className={sizeIconSlot} aria-hidden="true">
        <Icon state={iconState} />
      </span>
      <span className={sizeName}>{sizeNameOf(item.size)}</span>
      {item.price !== undefined ? (
        <span className={sizePrice}>{formatCurrencyAmount(item.price)}</span>
      ) : null}
      {total !== undefined ? (
        <span className={sizeCount}>
          {m.locker_detail_size_count({ count: total })}
        </span>
      ) : null}
      {hasGauge ? (
        <div className={gauge}>
          <div className={gaugeTrack} aria-hidden="true">
            <div
              className={gaugeFill}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
          <span className={gaugeLabel}>
            <span aria-hidden="true">
              {availableCount}/{total}
            </span>
            <span className={visuallyHidden}>
              {m.locker_detail_size_available({
                available: availableCount,
                total,
              })}
            </span>
          </span>
        </div>
      ) : null}
    </li>
  );
}
