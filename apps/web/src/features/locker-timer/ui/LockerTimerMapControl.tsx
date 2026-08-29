import { m } from "@repo/i18n";
import { IconNavigationClock24 } from "@repo/ui/tokens/icons";
import { useActiveLockerTimer } from "../hooks/useActiveLockerTimer";
import { getRemainingTimeParts } from "../model/locker-timer-format";
import { control, remainingBadge } from "./LockerTimerMapControl.css";

const formatRemainingBadge = (remainingTimeInSeconds: number) => {
  const { hours, minutes } = getRemainingTimeParts(remainingTimeInSeconds);

  return hours > 0
    ? m.locker_timer_remaining_hours_minutes({ hours, minutes })
    : m.locker_timer_remaining_minutes({ minutes });
};

/**
 * 지도 위에서 진행 중인 타이머를 알리는 버튼.
 *
 * 누르면 여기서 모달을 열지 않고 해당 보관함 상세로 보낸다. 타이머는 늘 특정
 * 보관함에 걸린 것이라, 지도 위에서 남은 시간만 보여주면 어디에 걸었는지 확인할
 * 수 없고 그 자리에서 해제해도 무엇을 해제했는지 알기 어렵다.
 */
export function LockerTimerMapControl({
  buttonClassName,
  onSelect,
}: {
  buttonClassName: string;
  onSelect: (lockerId: number) => void;
}) {
  const { activeTimer, remainingTimeInSeconds, isVisible } =
    useActiveLockerTimer();

  if (!activeTimer || !isVisible) return null;

  const remainingLabel = formatRemainingBadge(remainingTimeInSeconds);

  return (
    <button
      type="button"
      className={[buttonClassName, control].join(" ")}
      onClick={() => onSelect(activeTimer.lockerId)}
      /*
       * 남은 시간을 이름에 함께 담는다. aria-label 은 자식 텍스트를 밀어내므로,
       * 배지만 두면 이 버튼의 핵심 정보가 화면 낭독에서 통째로 빠진다.
       */
      aria-label={`${m.locker_timer_map_control_aria()}, ${remainingLabel}`}
    >
      <IconNavigationClock24 />
      <span className={remainingBadge}>{remainingLabel}</span>
    </button>
  );
}
