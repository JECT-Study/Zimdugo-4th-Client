import { useEffect } from "react";

const SERVICE_WORKER_URL = "/sw.js";

/**
 * 워커가 서버에 직접 요청할 때 쓸 API 주소.
 *
 * `sw.js` 는 번들러를 거치지 않아 `import.meta.env` 를 읽을 수 없다. 등록 URL 의
 * 쿼리로 넘기면 워커가 다시 깨어나도 `self.location` 에 남아 있어, 열린 탭이
 * 없는 상태에서 오는 `pushsubscriptionchange` 도 처리할 수 있다.
 *
 * 값이 바뀌면 스크립트 URL 이 달라져 브라우저가 새 워커로 교체한다.
 */
const buildServiceWorkerUrl = () => {
  const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL ?? "";
  if (!apiBaseUrl) return SERVICE_WORKER_URL;

  return `${SERVICE_WORKER_URL}?api=${encodeURIComponent(apiBaseUrl)}`;
};

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
        await navigator.serviceWorker.register(buildServiceWorkerUrl(), {
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
