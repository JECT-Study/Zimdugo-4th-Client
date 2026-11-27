import { m } from "@repo/i18n";
import { useMinuteTick } from "#/shared/hooks/useMinuteTick";
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import {
  indicator,
  line,
  status,
  updated,
} from "./LockerRealtimeStatusLine.css";
import liveIndicatorUrl from "./live-indicator.svg";

export interface LockerRealtimeStatusLineProps {
  /** 실시간 정보를 받은 시각. "방금 업데이트" 처럼 보여 준다. */
  fetchedAt: string;
  className?: string;
}

/**
 * 실시간 이용 가능 표시 한 줄. 깜빡이는 점, "실시간 이용 가능", 업데이트 시각.
 *
 * 크기별 남은 칸 수 없이 실시간 정보가 있다는 사실과 그 시각만 알린다. 남은 칸 수는
 * 크기 카드의 게이지처럼 곁에 있는 화면이 보여 준다.
 */
export function LockerRealtimeStatusLine({
  fetchedAt,
  className,
}: LockerRealtimeStatusLineProps) {
  // 화면을 열어 둔 채로도 "방금" -> "n분 전" 경계를 넘어가도록 분마다 다시 그린다.
  useMinuteTick();

  return (
    <p className={[line, className].filter(Boolean).join(" ")}>
      <img src={liveIndicatorUrl} alt="" className={indicator} />
      <span className={status}>{m.locker_detail_realtime_status()}</span>
      <span className={updated}>{formatUpdatedLabel(fetchedAt)}</span>
    </p>
  );
}
