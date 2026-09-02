import { m } from "@repo/i18n";
import { useCallback, useState } from "react";
import { getPushErrorCode, PUSH_ERROR_CODE } from "#/shared/api/push";
import {
  ensurePushSubscription,
  isIosWithoutInstall,
  isPushSupported,
} from "../lib/push-subscription";
import {
  useActiveReminderQuery,
  useCreateReminderMutation,
  useDeleteReminderMutation,
} from "./push-reminder-queries";

/**
 * 타이머 한 벌을 서버 상태로 다룬다.
 *
 * 로컬 저장소에 복제하지 않는다. 서버가 소스이므로 실패하면 타이머도 서지
 * 않아야 하고, 그 실패가 화면에 그대로 드러나야 한다. 조용히 로컬로 흘려보내면
 * 어디가 막혔는지 알 수 없다.
 */

export type LockerTimerFailure =
  | { kind: "unsupported" }
  | { kind: "ios-install-required" }
  | { kind: "permission-denied" }
  | { kind: "subscription-missing" }
  | { kind: "subscription-conflict" }
  | { kind: "invalid-schedule" }
  | { kind: "limit-exceeded" }
  | { kind: "rate-limited" }
  | { kind: "unknown"; code: string };

/**
 * `startedAt` 에 얹는 여유.
 *
 * 서버는 `startedAt` 이 현재 시각보다 뒤여야 한다고 요구한다. 하한이 공유되지
 * 않은 채 하루 사이 1 초에서 1~5 초로 움직인 적이 있어(#209) 넉넉히 잡았다.
 *
 * 종료 시각은 밀지 않는다. 사용자가 고른 시간이 그대로 `endAt` 이어야 모달이
 * 보여 준 종료 시각과 실제가 어긋나지 않는다. 대신 전체 이용 시간이 이만큼
 * 짧게 기록된다.
 */
const START_BUFFER_MS = 10_000;

const toFailure = (error: unknown): LockerTimerFailure => {
  const code = getPushErrorCode(error);

  switch (code) {
    case PUSH_ERROR_CODE.SubscriptionMissing:
      return { kind: "subscription-missing" };
    case PUSH_ERROR_CODE.SubscriptionConflict:
      return { kind: "subscription-conflict" };
    case PUSH_ERROR_CODE.InvalidSchedule:
      return { kind: "invalid-schedule" };
    case PUSH_ERROR_CODE.LimitExceeded:
      return { kind: "limit-exceeded" };
    case PUSH_ERROR_CODE.RateLimited:
      return { kind: "rate-limited" };
    default:
      // 서버가 코드를 주지 않는 실패(네트워크 단절, COMMON-500)도 여기로 온다.
      // 코드를 문구에 남겨 두어야 어느 지점이 막혔는지 화면만 보고 알 수 있다.
      return { kind: "unknown", code: code ?? "network" };
  }
};

export const describeFailure = (failure: LockerTimerFailure): string => {
  switch (failure.kind) {
    case "unsupported":
      return m.locker_timer_error_unsupported();
    case "ios-install-required":
      return m.locker_timer_error_ios_install();
    case "permission-denied":
      return m.locker_timer_error_permission_denied();
    case "subscription-missing":
      return m.locker_timer_error_subscription();
    case "subscription-conflict":
      return m.locker_timer_error_subscription_conflict();
    case "invalid-schedule":
      return m.locker_timer_error_schedule();
    case "limit-exceeded":
      return m.locker_timer_error_limit();
    case "rate-limited":
      return m.locker_timer_error_rate_limited();
    default:
      return m.locker_timer_error_unknown({ code: failure.code });
  }
};

export interface LockerTimerSessionState {
  /** 이 보관함에서 돌고 있는 타이머. 다른 보관함 것이면 null */
  endAt: number | null;
  totalSeconds: number;
  isPending: boolean;
  failure: LockerTimerFailure | null;
  clearFailure: () => void;
  start: (durationInSeconds: number) => Promise<boolean>;
  stop: () => Promise<boolean>;
}

export const useLockerTimerSession = (
  lockerId: number,
): LockerTimerSessionState => {
  const { data: reminder } = useActiveReminderQuery();
  const createReminder = useCreateReminderMutation();
  const deleteReminder = useDeleteReminderMutation();
  const [failure, setFailure] = useState<LockerTimerFailure | null>(null);

  const isForThisLocker = reminder?.lockerId === lockerId;

  const start = useCallback(
    async (durationInSeconds: number) => {
      setFailure(null);

      if (!isPushSupported()) {
        setFailure(
          isIosWithoutInstall()
            ? { kind: "ios-install-required" }
            : { kind: "unsupported" },
        );
        return false;
      }

      // 권한 요청은 사용자 제스처 안에서 일어나야 브라우저가 팝업을 띄운다.
      // 이 함수가 버튼 핸들러에서 곧바로 불리는 이유다.
      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      if (permission !== "granted") {
        setFailure({ kind: "permission-denied" });
        return false;
      }

      try {
        await ensurePushSubscription();

        const startedAt = new Date(Date.now() + START_BUFFER_MS);
        const endAt = new Date(Date.now() + durationInSeconds * 1000);

        await createReminder.mutateAsync({
          lockerId,
          startedAt: startedAt.toISOString(),
          endAt: endAt.toISOString(),
        });

        return true;
      } catch (error) {
        setFailure(toFailure(error));
        return false;
      }
    },
    [lockerId, createReminder],
  );

  const stop = useCallback(async () => {
    setFailure(null);
    if (!reminder) return true;

    try {
      await deleteReminder.mutateAsync(reminder.id);
      return true;
    } catch (error) {
      setFailure(toFailure(error));
      return false;
    }
  }, [reminder, deleteReminder]);

  return {
    endAt: isForThisLocker ? Date.parse(reminder.endAt) : null,
    totalSeconds: isForThisLocker ? reminder.totalUsageMinutes * 60 : 0,
    isPending: createReminder.isPending || deleteReminder.isPending,
    failure,
    clearFailure: () => setFailure(null),
    start,
    stop,
  };
};
