export interface RemainingTimeParts {
  hours: number;
  minutes: number;
}

/**
 * 남은 시간을 시·분으로 나눈다.
 *
 * 초를 버리지 않고 분 단위로 올린 뒤에 시·분으로 쪼갠다. 시와 분을 각각 계산하면
 * 두 가지가 어긋난다. 버림으로 맞추면 59초 남았을 때 타이머가 도는 중인데도
 * `00 : 00` 이 되고, 분만 올림으로 맞추면 7,199초가 `1시간 60분` 이 된다.
 */
export const getRemainingTimeParts = (
  remainingTimeInSeconds: number,
): RemainingTimeParts => {
  const totalMinutes = Math.ceil(Math.max(0, remainingTimeInSeconds) / 60);

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};
