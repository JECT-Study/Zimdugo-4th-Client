import { useEffect, useState } from "react";

const MINUTE_MS = 60_000;

/**
 * 1분마다 값이 바뀌어 상대 시간 표시를 다시 그리게 하는 훅.
 *
 * 상대 시간은 렌더 시점의 now 로 계산되므로, 화면을 열어 둔 채 아무 상태도 바뀌지
 * 않으면 "방금 업데이트" 가 몇 시간이 지나도 그대로 남는다. 표시 단위가 분이라
 * 1분 간격이면 충분하다.
 *
 * 첫 틱만 다음 분 경계에 맞춘다. 그래야 화면에 붙은 시각과 라벨이 최대 1분 안에
 * 맞춰지고, 이후에는 경계에서 함께 넘어간다.
 */
export const useMinuteTick = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const msToNextMinute = MINUTE_MS - (Date.now() % MINUTE_MS);

    const timeoutId = setTimeout(() => {
      setTick((current) => current + 1);
      intervalId = setInterval(
        () => setTick((current) => current + 1),
        MINUTE_MS,
      );
    }, msToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, []);

  return tick;
};
