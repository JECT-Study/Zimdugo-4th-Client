import type { ApiLocale } from "#/shared/i18n/api-locale";
import { httpDelete, httpGet, httpPost, httpPut } from "#/shared/lib/apiClient";
import type { BackendResponse } from "./lockers";

/**
 * 웹 푸시 타이머 API.
 *
 * 로그인과 무관하게 동작한다. 서버는 `deviceToken` 쿠키로 기기를 가리고,
 * 그 쿠키는 `HttpOnly` 라 클라이언트가 읽거나 만들 수 없다. axios 인스턴스가
 * `withCredentials: true` 라 쿠키는 자동으로 실린다.
 *
 * 상태를 바꾸는 요청은 서버가 허용 Origin 을 검증한다. 브라우저는 `Origin` 을
 * 자동으로 붙이므로 앱에서는 문제가 없지만, curl 로 재현할 때는 직접 붙여야
 * 한다. 붙이지 않으면 `COMMON-403` 이 온다.
 */

/** 서버가 쓰는 푸시 오류 코드. 화면 문구를 가르는 기준이다. */
export const PUSH_ERROR_CODE = {
  /** 발화 시각이 올바르지 않다. 시작·종료 순서, 최소 여유 시간 위반 */
  InvalidSchedule: "PUSH-400-1",
  /** 최대 예약 기간 또는 기기당 활성 리마인더 한도 초과 */
  LimitExceeded: "PUSH-400-2",
  /** 다른 기기에 이미 묶인 `endpoint` 다. 명세의 멱등 upsert 와 어긋난다 */
  SubscriptionConflict: "PUSH-409-1",
  /** 현재 기기에 등록된 활성 푸시 구독이 없다 */
  SubscriptionMissing: "PUSH-409-2",
  /** 기기 또는 IP 기준 요청 한도 초과 */
  RateLimited: "PUSH-429-1",
} as const;

/**
 * 실패 응답에서 서버 오류 코드를 꺼낸다.
 *
 * axios 를 호출부까지 끌고 가지 않으려고 형태만 보고 판단한다. 네트워크 실패나
 * 취소처럼 응답 자체가 없는 경우에는 `undefined` 를 준다.
 */
export const getPushErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error == null) {
    return undefined;
  }

  const code = (error as { response?: { data?: { code?: unknown } } }).response
    ?.data?.code;

  return typeof code === "string" ? code : undefined;
};

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionUpsertBody {
  endpoint: string;
  keys: PushSubscriptionKeys;
  /**
   * 발송 시점에 알림 문구를 만들 언어.
   *
   * 헤더로 대신할 수 없다. 푸시는 요청 없이 나중에 나가므로 그 시점에는
   * `Accept-Language` 가 존재하지 않는다.
   */
  locale: ApiLocale;
}

export interface PushReminder {
  id: number;
  lockerId: number;
  /** UTC ISO-8601 */
  startedAt: string;
  /** UTC ISO-8601 */
  endAt: string;
  totalUsageMinutes: number;
  /** 응답 생성 시점의 서버 시간 기준 잔여 분 */
  remainingMinutes: number;
  /** 서버가 값을 주지 않으면 null 로 온다 */
  remindBeforeMinutes: number | null;
}

export interface PushReminderCreateBody {
  lockerId: number;
  startedAt: string;
  endAt: string;
  remindBeforeMinutes?: number;
}

const unwrap = <T>(response: BackendResponse<T> | undefined): T => {
  if (response?.data == null) {
    throw new Error(response?.message ?? "API response data is missing.");
  }

  return response.data;
};

/**
 * 앱 최초 진입 시 한 번 호출한다.
 *
 * 쿠키가 없거나 유효하지 않으면 새 `deviceToken` 을 발급하고, 이미 유효하면
 * 같은 기기를 유지하며 `Set-Cookie` 를 다시 보내지 않는다.
 */
export const postPushDevice = async (signal?: AbortSignal): Promise<void> => {
  await httpPost("/api/v1/push/devices", null, { signal });
};

/** `pushManager.subscribe()` 에 넘길 VAPID 공개키. base64url 에 `=` 패딩이 붙어 온다. */
export const getPushVapidPublicKey = async (
  signal?: AbortSignal,
): Promise<string> => {
  const response = await httpGet<BackendResponse<{ publicKey: string }>>(
    "/api/v1/push/vapid-key",
    { signal },
  );

  return unwrap(response).publicKey;
};

/**
 * 구독 등록·갱신.
 *
 * 서버는 `endpoint` 기준으로 upsert 한다고 하지만, 다른 기기에 이미 묶인
 * `endpoint` 는 `PUSH-409-1` 로 거부한다. 쿠키를 잃은 재방문자가 여기에
 * 걸린다. 해소되기 전까지는 호출부가 실패를 그대로 드러내야 한다.
 */
export const putPushSubscription = async (
  body: PushSubscriptionUpsertBody,
  signal?: AbortSignal,
): Promise<void> => {
  await httpPut("/api/v1/push/subscriptions", body, { signal });
};

/** 알림 권한 취소나 구독 소실을 감지했을 때. 구독이 이미 없어도 200 이다. */
export const deletePushSubscription = async (
  signal?: AbortSignal,
): Promise<void> => {
  await httpDelete("/api/v1/push/subscriptions", { signal });
};

/** 현재 기기의 활성 리마인더. 기기당 하나지만 응답은 배열이다. */
export const getPushReminders = async (
  signal?: AbortSignal,
): Promise<PushReminder[]> => {
  const response = await httpGet<BackendResponse<PushReminder[]>>(
    "/api/v1/push/reminders",
    { signal },
  );

  return unwrap(response);
};

export const postPushReminder = async (
  body: PushReminderCreateBody,
  signal?: AbortSignal,
): Promise<PushReminder> => {
  const response = await httpPost<
    BackendResponse<PushReminder>,
    PushReminderCreateBody
  >("/api/v1/push/reminders", body, { signal });

  return unwrap(response);
};

/** 이미 없거나 다른 기기 소유여도 200 을 돌려준다. */
export const deletePushReminder = async (
  reminderId: number,
  signal?: AbortSignal,
): Promise<void> => {
  await httpDelete(`/api/v1/push/reminders/${reminderId}`, { signal });
};
