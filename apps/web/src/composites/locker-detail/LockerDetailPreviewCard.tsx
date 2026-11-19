import { m } from "@repo/i18n";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import {
  previewAddress,
  previewCard,
  previewFactLabel,
  previewFacts,
  previewFactValue,
  previewTitle,
  previewUpdated,
} from "./LockerDetailPreviewCard.css";

export interface LockerDetailPreviewCardProps {
  locker: LockerDetailItem;
}

/**
 * 지도가 뜨기 전에 보이는 보관함 요약.
 *
 * 상세 시트는 지도 SDK 가 붙은 뒤에야 올라온다. 그 전까지 서버 HTML 에는 보관함
 * 정보가 하나도 없어, JS 를 돌리지 않는 크롤러(네이버, 생성형 답변 엔진)는 빈
 * 페이지로 보고, 사람도 지도가 뜰 때까지 아무것도 읽을 수 없었다.
 *
 * 그 사이를 이 카드가 채운다. 서버 로더가 가져온 상세로 그리므로 서버 HTML 에
 * 그대로 실리고, 하이드레이션도 같은 값으로 한다. 지도가 준비되면 실제 시트로
 * 바뀐다. 사람에게도 보이는 내용이라 크롤러에게만 보이는 숨김 텍스트가 아니다.
 *
 * 값은 수집 시점에 오래 남는다. 자주 바뀌는 실시간 잔여 칸과 거리는 싣지 않고,
 * 정보 기준일을 함께 적는다.
 */
export function LockerDetailPreviewCard({
  locker,
}: LockerDetailPreviewCardProps) {
  const facts = [
    { label: m.locker_preview_floor_label(), value: locker.floorLabel },
    {
      label: m.locker_preview_hours_label(),
      // "운영시간: 운영시간 미제공" 처럼 이름표를 되풀이하는 값은 싣지 않는다.
      value:
        locker.operatingHoursLabel ===
        m.locker_detail_operating_hours_not_provided()
          ? undefined
          : locker.operatingHoursLabel,
    },
    { label: m.locker_detail_price_section(), value: locker.priceLabel },
    { label: m.locker_detail_size_section(), value: locker.sizeLabel },
  ].flatMap((fact) =>
    fact.value?.trim() ? [{ label: fact.label, value: fact.value }] : [],
  );

  return (
    <article
      className={previewCard}
      aria-label={m.locker_detail_summary_aria()}
    >
      <h1 className={previewTitle}>{locker.title}</h1>
      {locker.address ? (
        <p className={previewAddress}>
          <span className={previewFactLabel}>
            {m.locker_preview_address_label()}{" "}
          </span>
          {locker.address}
        </p>
      ) : null}
      {facts.length > 0 ? (
        <dl className={previewFacts}>
          {facts.map((fact) => (
            <div key={fact.label} style={{ display: "contents" }}>
              <dt className={previewFactLabel}>{fact.label}</dt>
              <dd className={previewFactValue}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {locker.detailHelpText ? (
        <p className={previewAddress}>{locker.detailHelpText}</p>
      ) : null}
      {locker.lastUpdatedLabel ? (
        <p className={previewUpdated}>{locker.lastUpdatedLabel}</p>
      ) : null}
    </article>
  );
}
