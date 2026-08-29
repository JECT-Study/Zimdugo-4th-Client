import { useEffect, useState } from "react";
import {
  type ActiveLockerTimer,
  getActiveLockerTimer,
  subscribeLockerTimerStorage,
} from "../model/locker-timer-storage";

export interface ActiveLockerTimerState {
  /** 가장 임박한 타이머. 없으면 null */
  activeTimer: ActiveLockerTimer | null;
  remainingTimeInSeconds: number;
  /** 지도 컨트롤이 실제로 그려지는 조건 */
  isVisible: boolean;
}

/**
 * 지금 돌고 있는 타이머.
 *
 * 지도 컨트롤과, 그 컨트롤이 차지할 높이를 미리 잡아 두는 홈 화면이 같은 값을
 * 봐야 한다. 컨트롤 안에만 두면 부모는 버튼이 섰는지 알 수 없어 스택 높이를
 * 두 개 기준으로 계산하게 된다.
 */
export const useActiveLockerTimer = (): ActiveLockerTimerState => {
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

  return {
    activeTimer,
    remainingTimeInSeconds,
    isVisible: activeTimer !== null && remainingTimeInSeconds > 0,
  };
};
