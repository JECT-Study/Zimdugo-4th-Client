import { m } from "@repo/i18n";
import {
  IconInfo16,
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
  extraLines,
  gaugeFill,
  gaugeTrack,
  note,
  noteText,
  root,
  sizeCard,
  sizeCount,
  sizeGrid,
  sizeIconSlot,
  sizeName,
  sizePrice,
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

const SIZE_ORDER: readonly LockerSizeType[] = ["SMALL", "MEDIUM", "LARGE"];

/**
 * 남은 칸 비율의 단계. 20% 이하는 거의 없음(빨강), 50% 이하는 적음(노랑), 그 위는
 * 넉넉함(초록)이다.
 */
const gaugeLevelOf = (ratio: number): "ample" | "low" | "critical" =>
  ratio <= 0.2 ? "critical" : ratio <= 0.5 ? "low" : "ample";

/**
 * 보관함 상세 정보를 그림으로 보여 준다.
 *
 * 개수·요금을 크기별 칸 카드와 요금 기준으로 펼친다. 상세위치는 보관함 이름이 대개
 * 이미 담고 있어 따로 달지 않는다. 읽지 못한 줄은 원문 그대로 아래에 남긴다.
 *
 * 카드는 소형·중형·대형 세 장을 늘 같은 줄(그림·이름·요금·게이지·칸 수)로 그린다.
 * 값이 없는 줄은 비워 자리만 둔다. 카드마다 줄 수가 다르면 같은 정보가 서로 다른
 * 높이에 놓여 견주어 읽기 어렵다.
 */
export function LockerDetailInfoGraphic({
  info,
  realtimeAvailability,
}: LockerDetailInfoGraphicProps) {
  const availability = realtimeAvailability?.isAvailable
    ? realtimeAvailability
    : null;
  /*
   * 개수 줄을 읽었을 때만 "목록에 없는 크기 = 이 보관함에 없는 크기" 로 본다. 요금
   * 줄만 읽었으면 빠진 크기가 실제로 없는지 알 수 없어 비워 둔다.
   */
  const hasCountData = info.sizes.some((item) => item.count !== undefined);
  /*
   * 실시간 정보가 있으면 카드마다 남은 칸을 보여 준다. 데스크톱 패널은 이때 실시간
   * 카드를 따로 두지 않으므로, 전체 칸 수를 모르는 크기도 남은 칸은 빠짐없이 그린다.
   */
  const showsGauge = availability !== null;

  return (
    <section className={root} aria-label={m.locker_detail_info_section()}>
      {info.sizes.length > 0 ? (
        <ul className={sizeGrid}>
          {SIZE_ORDER.map((size) => (
            <SizeCardItem
              key={size}
              size={size}
              item={info.sizes.find((item) => item.size === size)}
              isKnownAbsent={hasCountData}
              showsGauge={showsGauge}
              availableCount={
                availability ? availableCountOf(size, availability) : undefined
              }
            />
          ))}
        </ul>
      ) : null}

      {/*
        요금이 무엇의 값인지(예: 평일 기본 4시간 기준)를 카드 아래 안내 한 줄로
        덧붙인다. 상세 정보의 요금 줄 괄호 안 문장 그대로다.
      */}
      {info.priceBasis ? (
        <p className={note}>
          <IconInfo16 />
          <span className={noteText}>
            {m.locker_detail_price_basis({ basis: info.priceBasis })}
          </span>
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

type SizeCardState = "available" | "full" | "absent" | "unknown";

function SizeCardItem({
  size,
  item,
  isKnownAbsent,
  showsGauge,
  availableCount,
}: {
  size: LockerSizeType;
  item?: LockerSizeInfo;
  /** 목록에 없으면 이 보관함에 없는 크기로 봐도 되는가. */
  isKnownAbsent: boolean;
  /** 카드들이 게이지 줄을 두는가. 한 카드라도 두면 모두 그 자리를 남긴다. */
  showsGauge: boolean;
  availableCount?: number;
}) {
  const Icon = SIZE_ICONS[size];
  const total = item?.count;
  /*
   * - absent: 이 보관함에 없는 크기. 상세 정보에 아예 없거나 0개로 적혔다. 둘은
   *   쓰는 사람에게 같은 뜻이라 점선 카드에 "없음" 하나로 보인다.
   * - full: 칸은 있지만 실시간으로 남은 칸이 없다.
   * - available: 칸이 있다(실시간으로 남은 칸이 있거나 실시간 정보가 없다).
   * - unknown: 개수를 모른다(요금만 읽혔다).
   *
   * 상세 정보가 없다거나 개수를 몰라도 실시간 정보에 남은 칸이 있으면 실시간을
   * 믿고 칸이 있는 크기로 본다. 상세 정보는 사람이 적은 글이라 늦을 수 있다.
   */
  const hasRealtimeRemaining =
    availableCount !== undefined && availableCount > 0;
  const detailState: SizeCardState = !item
    ? isKnownAbsent
      ? "absent"
      : "unknown"
    : total === 0
      ? "absent"
      : total === undefined
        ? "unknown"
        : availableCount === 0
          ? "full"
          : "available";
  const state: SizeCardState =
    hasRealtimeRemaining &&
    (detailState === "absent" || detailState === "unknown")
      ? "available"
      : detailState;
  const iconState =
    state === "absent" ? "disabled" : state === "full" ? "default" : "selected";
  const hasGaugeFill =
    showsGauge &&
    availableCount !== undefined &&
    total !== undefined &&
    total > 0;
  const ratio = hasGaugeFill ? Math.min(1, availableCount / total) : 0;
  const countText = hasGaugeFill
    ? m.locker_detail_size_available({ available: availableCount, total })
    : hasRealtimeRemaining
      ? m.locker_detail_size_remaining({ available: availableCount })
      : state === "absent"
        ? m.locker_detail_size_not_offered()
        : total !== undefined && total > 0
          ? m.locker_detail_size_count({ count: total })
          : "";

  return (
    <li className={sizeCard} data-state={state}>
      <span className={sizeIconSlot} aria-hidden="true">
        <Icon state={iconState} />
      </span>
      <span className={sizeName}>{sizeNameOf(size)}</span>
      <span className={sizePrice}>
        {item?.price !== undefined ? formatCurrencyAmount(item.price) : ""}
      </span>
      {showsGauge ? (
        <span
          className={gaugeTrack}
          data-filled={hasGaugeFill ? "true" : "false"}
          aria-hidden="true"
        >
          {hasGaugeFill ? (
            <span
              className={gaugeFill}
              data-level={gaugeLevelOf(ratio)}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          ) : null}
        </span>
      ) : null}
      <span className={sizeCount}>{countText}</span>
    </li>
  );
}
