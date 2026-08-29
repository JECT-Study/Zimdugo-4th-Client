import { m } from "@repo/i18n";
import { IconNavigationClock24 } from "@repo/ui/tokens/icons";
import { useEffect, useState } from "react";
import { getRemainingTimeParts } from "../model/locker-timer-format";
import {
  type ActiveLockerTimer,
  getActiveLockerTimer,
  subscribeLockerTimerStorage,
} from "../model/locker-timer-storage";
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
  const [activeTimer, setActiveTimer] = useState<ActiveLockerTimer | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const remainingTimeInSeconds = activeTimer
    ? Math.max(0, Math.ceil((activeTimer.endAt - currentTime) / 1000))
    : 0;

  useEffect(() => {
    const refreshTimer = () => {
      setActiveTimer(getActiveLockerTimer());
      setCurrentTime(Date.now());
    };

    refreshTimer();
    return subscribeLockerTimerStorage(refreshTimer);
  }, []);

  useEffect(() => {
    if (!activeTimer) return;

    const intervalId = window.setInterval(() => {
      const nextTime = Date.now();
      setCurrentTime(nextTime);

      // 다시 읽는 과정에서 만료된 항목이 저장소에서 정리된다.
      if (activeTimer.endAt <= nextTime) {
        setActiveTimer(getActiveLockerTimer());
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeTimer]);

  if (!activeTimer || remainingTimeInSeconds <= 0) return null;

  return (
    <button
      type="button"
      className={[buttonClassName, control].join(" ")}
      onClick={() => onSelect(activeTimer.lockerId)}
      aria-label={m.locker_timer_map_control_aria()}
    >
      <IconNavigationClock24 />
      <span className={remainingBadge}>
        {formatRemainingBadge(remainingTimeInSeconds)}
      </span>
    </button>
  );
}
