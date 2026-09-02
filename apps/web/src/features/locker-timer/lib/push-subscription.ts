import { languageTag } from "@repo/i18n";
import {
  deletePushSubscription,
  getPushVapidPublicKey,
  putPushSubscription,
} from "#/shared/api/push";
import { type ApiLocale, toAcceptLanguage } from "#/shared/i18n/api-locale";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";

/**
 * 브라우저 푸시 구독과 서버 등록을 잇는 층.
 *
 * 서비스 워커 등록은 `useServiceWorker` 가 이미 하고 있다. 여기서는 권한이
 * 허용된 뒤의 구독만 다룬다.
 */

/**
 * VAPID 공개키를 `applicationServerKey` 가 받는 형태로 옮긴다.
 *
 * 서버는 base64url 에 `=` 패딩을 붙여 보낸다. `atob` 은 base64url 의 `-`·`_`
 * 를 모르고 패딩 길이도 맞아야 하므로, 패딩을 다시 계산해 붙이고 표준 알파벳으로
 * 되돌린다. 결과는 65 바이트 P-256 비압축 좌표다.
 */
export const urlBase64ToUint8Array = (
  base64Url: string,
): Uint8Array<ArrayBuffer> => {
  const withoutPadding = base64Url.replace(/=+$/, "");
  const padded = withoutPadding.padEnd(
    withoutPadding.length + ((4 - (withoutPadding.length % 4)) % 4),
    "=",
  );
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);

  // ArrayBuffer 로 좁혀 둔다. applicationServerKey 는 SharedArrayBuffer 를
  // 받지 않아, 기본 추론(ArrayBufferLike)으로는 대입되지 않는다.
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

/** 이 브라우저에서 푸시를 받을 수 있는지. iOS 는 홈 화면에 설치해야 여기가 참이 된다. */
export const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

/**
 * iOS Safari 에서 홈 화면에 설치되지 않은 상태인지.
 *
 * 설치 전에는 `PushManager` 자체가 없어 `isPushSupported` 가 거짓이 된다. 그
 * 거짓을 "이 브라우저는 원래 안 됨" 과 "설치하면 됨" 으로 갈라야 안내 문구가
 * 달라진다.
 */
export const isIosWithoutInstall = (): boolean => {
  if (typeof navigator === "undefined") return false;

  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // 아이패드는 데스크톱 UA 를 쓰면서 터치를 지원한다.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIos) return false;

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS 전용 비표준 속성. 표준 쪽이 거짓이어도 설치된 경우가 있다.
    (navigator as { standalone?: boolean }).standalone === true;

  return !isStandalone;
};

const resolvePushLocale = () =>
  toAcceptLanguage(normalizeLocale(languageTag()) ?? BASE_LOCALE);

/**
 * 서비스 워커 등록이 실패했을 때.
 *
 * 오류 응답이 아니라 브라우저 쪽 사정이라 서버 코드로 가릴 수 없다. 화면 문구를
 * 가르려고 따로 둔다.
 */
export class PushUnavailableError extends Error {
  constructor() {
    super("서비스 워커가 준비되지 않았습니다.");
    this.name = "PushUnavailableError";
  }
}

/** 워커가 활성화되기를 기다리는 한도. */
const SERVICE_WORKER_READY_TIMEOUT_MS = 10_000;

/**
 * 활성 워커를 기다린다.
 *
 * `navigator.serviceWorker.ready` 는 등록이 실패해도 거부되지 않고 영원히
 * 기다린다. 그대로 두면 시작 흐름이 잠긴 채 풀리지 않아, 화면은 진행 중으로 남고
 * 사용자가 다시 시도할 수도 없다. 한도를 두고 실패로 끊는다.
 */
const getRegistration = async () => {
  let timeoutId: number | undefined;

  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(
          () => reject(new PushUnavailableError()),
          SERVICE_WORKER_READY_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

/**
 * 구독을 만들고 서버에 등록한다.
 *
 * 이미 구독이 있으면 그대로 쓰고 등록만 다시 보낸다. 서버가 `endpoint` 기준
 * upsert 라 재호출이 안전하고, 언어가 바뀐 경우도 이 경로로 반영된다.
 *
 * 권한 요청은 하지 않는다. 호출부가 사용자 제스처 안에서 먼저 받아야 브라우저가
 * 팝업을 띄운다.
 */
export const ensurePushSubscription = async (
  locale: ApiLocale = resolvePushLocale(),
  signal?: AbortSignal,
): Promise<PushSubscription> => {
  const registration = await getRegistration();
  const existing = await registration.pushManager.getSubscription();

  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      // 브라우저가 요구한다. 푸시를 받으면 반드시 알림을 띄우겠다는 약속이다.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        await getPushVapidPublicKey(signal),
      ),
    }));

  const { p256dh, auth } = subscription.toJSON().keys ?? {};
  if (!p256dh || !auth) {
    throw new Error("푸시 구독 키가 비어 있습니다.");
  }

  await putPushSubscription(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh, auth },
      locale,
    },
    signal,
  );

  return subscription;
};

/**
 * 구독을 걷어낸다.
 *
 * 브라우저 쪽을 먼저 끊고 서버에 알린다. 순서가 반대면 서버만 지워진 채 브라우저
 * 구독이 남아, 다음 등록에서 같은 `endpoint` 가 다른 기기에 묶여 있다는 이유로
 * 거부될 수 있다.
 *
 * 리마인더는 그대로 남는다. 서버는 발송 시점에 활성 구독이 없으면 건너뛴다.
 */
export const revokePushSubscription = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();

  await subscription?.unsubscribe();
  await deletePushSubscription();
};

/**
 * 앱 진입·언어 변경 때 구독을 현재 상태에 맞춘다.
 *
 * 권한이 허용돼 있으면 구독이 없더라도 새로 만든다. 브라우저가 구독을 무효화한
 * 뒤(`pushsubscriptionchange`) 열린 탭이 없었으면 통지를 받을 곳이 없어 그대로
 * 사라지는데, 다시 만들지 않으면 권한은 허용된 채 푸시만 영영 오지 않는다.
 *
 * 권한이 허용됐다는 것은 이 앱에서 타이머를 켜 본 적이 있다는 뜻이다. 권한을 준
 * 적이 없으면 `default`, 스스로 거둔 경우는 `denied` 라 여기로 오지 않는다.
 * 이미 허용된 권한으로 만드는 구독이라 팝업도 뜨지 않는다.
 */
export const syncPushSubscription = async (
  locale: ApiLocale = resolvePushLocale(),
  signal?: AbortSignal,
): Promise<boolean> => {
  if (!isPushSupported() || Notification.permission !== "granted") {
    return false;
  }

  await ensurePushSubscription(locale, signal);

  return true;
};
