import { languageTag } from "@repo/i18n";
import { useEffect } from "react";
import { postPushDevice } from "#/shared/api/push";
import { toAcceptLanguage } from "#/shared/i18n/api-locale";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import {
  ensurePushSubscription,
  isPushSupported,
  revokePushSubscription,
  syncPushSubscription,
} from "../lib/push-subscription";

/** `public/sw.js` 가 구독 소실을 알릴 때 쓰는 이름. 양쪽을 함께 고쳐야 한다. */
const SUBSCRIPTION_LOST_MESSAGE = "zimdugo:push-subscription-lost";

/**
 * 앱 진입 시 기기를 초기화하고, 이미 구독이 있으면 서버 쪽을 현재 상태에 맞춘다.
 *
 * 기기 초기화는 쿠키가 없을 때만 새 `deviceToken` 을 발급한다. 이미 유효하면
 * 서버가 같은 기기를 유지하므로 매 진입마다 불러도 신원이 흔들리지 않는다.
 *
 * 재동기화는 구독이 이미 있을 때만 한다. 없으면 사용자가 권한을 준 적이 없거나
 * 스스로 껐다는 뜻이라, 여기서 되살리면 의도를 거스른다. 언어를 바꾼 경우가
 * 이 경로로 반영된다.
 *
 * 실패는 앱 사용을 막지 않는다. 타이머를 켜는 시점에 같은 호출을 다시 하고,
 * 그때는 실패를 화면에 드러낸다.
 */
export const usePushDevice = () => {
  // 언어가 바뀌면 구독에 저장된 locale 도 다시 올려야 한다. 이펙트가 이 값을
  // 직접 넘기므로 재실행 조건이 코드에 드러난다.
  const locale = toAcceptLanguage(
    normalizeLocale(languageTag()) ?? BASE_LOCALE,
  );

  useEffect(() => {
    const controller = new AbortController();

    const bootstrap = async () => {
      try {
        await postPushDevice(controller.signal);
        if (controller.signal.aborted) return;

        // 사용자가 브라우저 설정에서 권한을 거둔 경우. 구독은 남아 있어 서버가
        // 계속 발송을 시도하므로 여기서 걷어낸다. 리마인더는 그대로 두고,
        // 서버가 발송 시점에 활성 구독이 없으면 건너뛴다.
        if (isPushSupported() && Notification.permission === "denied") {
          await revokePushSubscription();
          return;
        }

        await syncPushSubscription(locale);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.warn("푸시 기기 초기화 실패", error);
      }
    };

    void bootstrap();

    return () => controller.abort();
  }, [locale]);

  /*
   * 워커가 구독 소실을 알리면 다시 등록한다.
   *
   * 워커는 앱의 로케일을 몰라 죽은 구독을 지우고 통지만 한다. 재등록은 로케일을
   * 아는 이쪽에서 한다. 권한이 살아 있을 때만 하는데, 권한이 없다면 사용자가
   * 스스로 껐다는 뜻이라 몰래 되살리면 안 된다.
   */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== SUBSCRIPTION_LOST_MESSAGE) return;
      if (!isPushSupported() || Notification.permission !== "granted") return;

      ensurePushSubscription().catch((error) => {
        console.warn("푸시 구독 재등록 실패", error);
      });
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);
};
