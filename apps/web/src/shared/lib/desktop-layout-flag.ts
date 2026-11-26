import { DESKTOP_LAYOUT_FLAG_ATTRIBUTE } from "@repo/ui/tokens/layout/layout.css";

/**
 * 데스크톱 레이아웃 기능 플래그.
 *
 * 데스크톱 화면은 PR 여러 개로 나눠 main 에 들어오지만, 전 화면이 갖춰질 때까지 사용자에게는
 * 지금 화면이 그대로 보여야 한다. 그래서 html 에 플래그 속성이 붙어 있을 때만 데스크톱
 * 규칙(CSS 의 desktopLayoutSelector, JS 의 useIsDesktopLayout)이 켜진다.
 *
 * 켜는 길은 두 가지다.
 * - 배포 단위: 빌드 환경 변수 `VITE_FEATURE_DESKTOP_LAYOUT=true` (예: Vercel Preview 환경)
 * - 개인 확인: 주소에 `?desktop=1` 을 붙이면 이 브라우저에 기억된다. `?desktop=0` 으로 끈다.
 *
 * 전 화면 공개 후 안정되면 이 파일과 플래그 셀렉터를 걷어 낸다.
 */
const DESKTOP_LAYOUT_STORAGE_KEY = "zimdugo:desktop-layout";
const DESKTOP_LAYOUT_QUERY_PARAM = "desktop";

const isDesktopLayoutEnabledByEnv =
  import.meta.env.VITE_FEATURE_DESKTOP_LAYOUT === "true";

/**
 * 첫 페인트 전에 html 에 플래그 속성을 붙이는 인라인 스크립트.
 *
 * React 로 속성을 그리지 않는 이유는 하이드레이션이다. 주소 쿼리와 저장소 값은 서버가
 * 알 수 없어, React 가 그리면 서버와 클라이언트 마크업이 갈린다. 기기 판별 스크립트
 * (COMPACT_DEVICE_LAYOUT_SCRIPT) 와 같은 방식으로 React 밖에서 붙인다.
 */
export const DESKTOP_LAYOUT_FLAG_SCRIPT = `
(function () {
  try {
    var enabled = ${JSON.stringify(isDesktopLayoutEnabledByEnv)};
    var key = ${JSON.stringify(DESKTOP_LAYOUT_STORAGE_KEY)};
    var param = new URLSearchParams(window.location.search).get(${JSON.stringify(
      DESKTOP_LAYOUT_QUERY_PARAM,
    )});
    var stored = null;
    // 저장소가 막힌 환경(사생활 보호 모드, 샌드박스 iframe)에서도 주소의 값은 적용한다.
    try {
      if (param === "1" || param === "0") {
        window.localStorage.setItem(key, param);
      }
      stored = window.localStorage.getItem(key);
    } catch (_) {
    }
    var choice = param === "1" || param === "0" ? param : stored;
    if (choice === "1") enabled = true;
    if (choice === "0") enabled = false;
    if (enabled) {
      document.documentElement.setAttribute(${JSON.stringify(
        DESKTOP_LAYOUT_FLAG_ATTRIBUTE,
      )}, "true");
    }
  } catch (_) {
  }
})();
`;

/** 지금 문서에 데스크톱 레이아웃 플래그가 켜져 있는지. 클라이언트에서만 부른다. */
export const isDesktopLayoutFlagOn = () =>
  document.documentElement.getAttribute(DESKTOP_LAYOUT_FLAG_ATTRIBUTE) ===
  "true";
