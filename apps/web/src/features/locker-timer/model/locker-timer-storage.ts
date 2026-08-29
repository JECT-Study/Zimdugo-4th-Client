const LOCKER_TIMER_STORAGE_PREFIX = "zimdugo:locker-timer:";
const LOCKER_TIMER_CHANGE_EVENT = "zimdugo:locker-timer-change";

export interface LockerTimerSession {
  configuredTimeInSeconds: number;
  endAt: number;
}

export interface ActiveLockerTimer extends LockerTimerSession {
  lockerId: number;
}

const getLockerTimerStorageKey = (lockerId: number) =>
  `${LOCKER_TIMER_STORAGE_PREFIX}${lockerId}`;

const isValidLockerTimer = (
  session: LockerTimerSession,
): session is LockerTimerSession =>
  Number.isFinite(session.endAt) &&
  Number.isFinite(session.configuredTimeInSeconds) &&
  session.endAt > Date.now() &&
  session.configuredTimeInSeconds > 0;

export const getStoredLockerTimer = (
  lockerId: number,
): LockerTimerSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const storageKey = getLockerTimerStorageKey(lockerId);
    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) return null;

    const session = JSON.parse(storedValue) as LockerTimerSession;
    if (!isValidLockerTimer(session)) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

export const getActiveLockerTimer = (): ActiveLockerTimer | null => {
  if (typeof window === "undefined") return null;

  const activeTimers: ActiveLockerTimer[] = [];

  let storageKeys: string[];
  try {
    // 저장소가 막힌 환경에서는 length 를 읽는 것만으로도 예외가 난다.
    storageKeys = Array.from(
      { length: window.localStorage.length },
      (_, index) => window.localStorage.key(index),
    ).filter(
      // 옵셔널 체인만 쓰면 undefined 가 섞여 타입 술어의 boolean 과 안 맞는다.
      (key): key is string =>
        key?.startsWith(LOCKER_TIMER_STORAGE_PREFIX) ?? false,
    );
  } catch {
    return null;
  }

  for (const storageKey of storageKeys) {
    const lockerId = Number(
      storageKey.slice(LOCKER_TIMER_STORAGE_PREFIX.length),
    );
    const session = getStoredLockerTimer(lockerId);
    if (session) activeTimers.push({ lockerId, ...session });
  }

  return activeTimers.reduce<ActiveLockerTimer | null>(
    (nearestTimer, timer) =>
      nearestTimer === null || timer.endAt < nearestTimer.endAt
        ? timer
        : nearestTimer,
    null,
  );
};

export const saveLockerTimer = (
  lockerId: number,
  session: LockerTimerSession,
) => {
  try {
    window.localStorage.setItem(
      getLockerTimerStorageKey(lockerId),
      JSON.stringify(session),
    );
    window.dispatchEvent(new Event(LOCKER_TIMER_CHANGE_EVENT));
  } catch {
    // 저장소를 사용할 수 없는 환경에서도 호출부의 메모리 상태는 유지한다.
  }
};

export const removeLockerTimer = (lockerId: number) => {
  try {
    window.localStorage.removeItem(getLockerTimerStorageKey(lockerId));
    window.dispatchEvent(new Event(LOCKER_TIMER_CHANGE_EVENT));
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 호출부의 메모리 상태만 정리한다.
  }
};

export const subscribeLockerTimerStorage = (listener: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key?.startsWith(LOCKER_TIMER_STORAGE_PREFIX)) listener();
  };

  window.addEventListener(LOCKER_TIMER_CHANGE_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(LOCKER_TIMER_CHANGE_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
};
