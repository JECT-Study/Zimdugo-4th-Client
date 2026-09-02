import { useEffect, useState } from "react";
import { useActiveReminderQuery } from "../model/push-reminder-queries";

interface ActiveLockerTimer {
  lockerId: number;
  endAt: number;
  configuredTimeInSeconds: number;
}

export interface ActiveLockerTimerState {
  /** 지금 돌고 있는 타이머. 없으면 null */
  activeTimer: ActiveLockerTimer | null;
  remainingTimeInSeconds: number;
  /** 지도 컨트롤이 실제로 그려지는 조건 */
  isVisible: boolean;
}

/**
 * 지금 돌고 있는 타이머.
 *
 * 서버가 소스다. 기기당 하나만 허용되므로 고를 것이 없다.
 *
 * 남은 시간은 응답의 `remainingMinutes` 가 아니라 `endAt` 으로 센다. 전자는
 * 응답 생성 시점의 값이라 화면에 머무는 동안 굳어 버린다.
 */
export const useActiveLockerTimer = (): ActiveLockerTimerState => {
  const { data: reminder } = useActiveReminderQuery();
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const endAt = reminder ? Date.parse(reminder.endAt) : null;
  const remainingTimeInSeconds = endAt
    ? Math.max(0, Math.ceil((endAt - currentTime) / 1000))
    : 0;

  useEffect(() => {
    if (endAt === null) return;

    const intervalId = window.setInterval(
      () => setCurrentTime(Date.now()),
      1000,
    );

    return () => window.clearInterval(intervalId);
  }, [endAt]);

  return {
    activeTimer: reminder
      ? {
          lockerId: reminder.lockerId,
          endAt: Date.parse(reminder.endAt),
          configuredTimeInSeconds: reminder.totalUsageMinutes * 60,
        }
      : null,
    remainingTimeInSeconds,
    isVisible: reminder !== null && remainingTimeInSeconds > 0,
  };
};

/**
 * 지금 돌고 있는 타이머가 있는지만.
 *
 * 남은 시간이 필요 없는 쪽을 위한 것이다. `useActiveLockerTimer` 는 카운트다운을
 * 위해 매초 상태를 갱신하는데, 홈 화면처럼 지도·검색·시트를 전부 소유한 컴포넌트가
 * 그걸 구독하면 타이머가 도는 내내 화면 전체가 매초 다시 그려진다.
 *
 * 값이 실제로 바뀌는 때는 서버 상태가 바뀔 때와 타이머가 끝나는 순간뿐이라, 그 두
 * 시점에만 다시 확인한다.
 */
export const useHasActiveLockerTimer = () => {
  const { data: reminder } = useActiveReminderQuery();
  const endAt = reminder ? Date.parse(reminder.endAt) : null;
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    setHasExpired(false);
    if (endAt === null) return;

    const remainingMs = endAt - Date.now();
    if (remainingMs <= 0) {
      setHasExpired(true);
      return;
    }

    const timeoutId = window.setTimeout(
      () => setHasExpired(true),
      remainingMs + 50,
    );

    return () => window.clearTimeout(timeoutId);
  }, [endAt]);

  return endAt !== null && !hasExpired;
};
