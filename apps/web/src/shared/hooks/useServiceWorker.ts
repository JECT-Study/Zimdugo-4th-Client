import { useEffect } from "react";

const SERVICE_WORKER_URL = "/sw.js";

/**
 * 푸시 전용 서비스 워커를 등록한다.
 *
 * 워커는 `apps/web/public/sw.js` 에 있고 번들러를 거치지 않는다. 캐싱을 하지 않고
 * push 이벤트만 처리하므로, 등록만으로 앱 동작이 달라지는 부분은 없다.
 *
 * 실제 알림을 받으려면 사용자가 알림 권한을 허용하고 푸시 구독까지 마쳐야 한다.
 * 등록은 그 선행 단계일 뿐이라 권한을 요청하지 않는다.
 */
export const useServiceWorker = () => {
  useEffect(() => {
    // SSR 과 서비스 워커를 지원하지 않는 브라우저를 함께 걸러낸다.
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    const register = async () => {
      try {
        await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
          scope: "/",
        });
      } catch (error) {
        if (cancelled) return;

        // 등록 실패는 앱 사용을 막지 않는다. 알림만 못 받는다.
        console.warn("service worker 등록 실패", error);
      }
    };

    register();

    return () => {
      cancelled = true;
    };
  }, []);
};
