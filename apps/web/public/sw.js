/**
 * 푸시 전용 서비스 워커.
 *
 * 오프라인 캐싱은 범위 밖이라 fetch 핸들러를 두지 않는다. 캐싱을 넣으면 Nitro 의
 * SSR 응답과 프리렌더된 정적 HTML 을 가로채게 되어, 로케일 판정을 서버로
 * 일원화한 구조(#146, #147)와 충돌한다.
 *
 * 이 파일은 번들러를 거치지 않는다. import 를 쓸 수 없어 저장소의 상수를 재사용할
 * 수 없으므로 아이콘 경로와 페이로드 스키마가 여기에 중복된다. 어느 한쪽을 바꾸면
 * 반대쪽도 함께 고쳐야 한다.
 */

/** 알림 본문에 표시되는 앱 아이콘. */
const NOTIFICATION_ICON = "/icons/android-chrome-192x192.png";

/** 안드로이드 상태바에 표시되는 단색 실루엣. */
const NOTIFICATION_BADGE = "/icons/badge-96x96.png";

/**
 * 페이로드가 깨졌을 때 쓰는 문구.
 *
 * 브라우저는 push 이벤트마다 알림을 띄우기를 요구한다. 띄우지 않으면 크롬이
 * "백그라운드에서 업데이트됨" 같은 문구를 대신 보여주므로, 최소한의 알림이라도
 * 우리 문구로 띄운다. 서비스 워커에서는 paraglide 를 쓸 수 없어 기본 로케일로 둔다.
 */
const FALLBACK_TITLE = "짐두고";
const FALLBACK_BODY = "새로운 알림이 있습니다.";

self.addEventListener("install", () => {
  // 새 워커를 대기시키지 않고 바로 활성화한다. 페이로드 스키마가 바뀌었을 때
  // 구형 워커가 남아 잘못 표시하는 것을 막는다.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // 이미 열려 있던 탭도 새 워커가 관장하게 한다.
  event.waitUntil(self.clients.claim());
});

/**
 * 서버가 보내는 페이로드는 { title, body, url, tag? } 형태다.
 *
 * 문구는 서버가 사용자의 로케일로 번역해서 보낸다. url 은 로케일 prefix 가 없는
 * 상대 경로이고, 알림을 눌러 진입할 때 서버 로케일 가드가 선호에 맞는 경로로
 * 보내준다.
 *
 * 키가 잘못된 구독으로 발송하면 푸시 서비스는 201 을 반환하지만 기기에서 복호화가
 * 실패해 data 가 비거나 깨진 채로 도착한다. 그래서 파싱 실패를 정상 경로로 다룬다.
 */
const parsePushPayload = (event) => {
  if (!event.data) return null;

  try {
    const payload = event.data.json();
    return payload && typeof payload === "object" ? payload : null;
  } catch (_) {
    return null;
  }
};

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);

  const title =
    typeof payload?.title === "string" && payload.title
      ? payload.title
      : FALLBACK_TITLE;

  const options = {
    body:
      typeof payload?.body === "string" && payload.body
        ? payload.body
        : FALLBACK_BODY,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    // notificationclick 에서 꺼낼 수 있는 곳은 data 뿐이라 여기에 담아둔다.
    data: {
      url: typeof payload?.url === "string" ? payload.url : "/",
    },
  };

  // 같은 tag 의 알림은 쌓이지 않고 서로를 교체한다. 서버가 엔티티 단위로 발급한다.
  if (typeof payload?.tag === "string" && payload.tag) {
    options.tag = payload.tag;
  }

  // waitUntil 을 빼면 알림을 띄우기 전에 워커가 종료될 수 있다.
  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * 페이로드의 url 은 서버가 보낸 값이라 신뢰할 수 없는 입력이다. 절대 URL 을 그대로
 * 열면 오픈 리다이렉트가 되므로 같은 출처의 경로만 통과시킨다.
 *
 * "//evil.com" 은 프로토콜 상대 URL 이라 외부로 나간다. 앞의 "/" 하나만 보고
 * 판단하면 걸러지지 않으므로 따로 막는다.
 */
const toSameOriginPath = (url) => {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) {
    return "/";
  }

  return url;
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const path = toSameOriginPath(event.notification.data?.url);
  const target = new URL(path, self.location.origin);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        // 워커가 아직 제어하지 않는 탭도 후보에 넣는다. 그러지 않으면 이미 열려
        // 있는 앱을 두고 매번 새 탭을 띄우게 된다.
        includeUncontrolled: true,
      });

      const existing = windows.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );

      if (!existing) {
        await self.clients.openWindow(target.href);
        return;
      }

      await existing.focus();

      // 이미 그 화면이면 다시 띄우지 않는다.
      if (new URL(existing.url).pathname === target.pathname) return;

      // 로케일 prefix 가 없는 경로를 서버가 사용자의 선호에 맞게 붙여주므로
      // 클라이언트 라우팅이 아니라 실제 내비게이션으로 보낸다.
      // navigate 는 워커가 제어하는 탭에서만 되므로 실패하면 새 창으로 폴백한다.
      try {
        await existing.navigate(target.href);
      } catch (_) {
        await self.clients.openWindow(target.href);
      }
    })(),
  );
});
