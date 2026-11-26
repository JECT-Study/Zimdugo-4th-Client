/**
 * 작은 실기기(휴대폰) 판별.
 *
 * 화면 폭만으로는 데스크톱 브라우저를 좁힌 것과 휴대폰을 가를 수 없어, 터치 여부와 기기
 * 화면 크기를 함께 보고 html 에 `data-compact-device="true"` 를 붙인다. CSS 의
 * compactDeviceSelector 가 이 속성을 본다.
 */

/**
 * 인라인 스크립트의 판별 함수를 담아 두는 window 속성 이름.
 *
 * 확장 프로그램 등이 첫 페인트 뒤 DOM 을 건드려 하이드레이션이 실패하면, React 가 html
 * 부터 클라이언트에서 다시 그리며 React 가 모르는 이 속성을 지운다. 크기 변화 때 다시
 * 판별하긴 하지만 그 전까지는 휴대폰에서도 넓은 기기 배치로 보인다. 그래서 판별 함수를
 * 남겨 두고 루트가 마운트될 때 다시 부른다.
 */
const COMPACT_DEVICE_SYNC_KEY = "__zimdugoSyncCompactDevice";

/**
 * 첫 페인트 전에 html 에 기기 판별 속성을 붙이는 인라인 스크립트.
 *
 * React 로 속성을 그리지 않는 이유는 하이드레이션이다. 서버는 기기를 알 수 없어, React 가
 * 그리면 서버와 클라이언트 마크업이 갈린다.
 */
export const COMPACT_DEVICE_LAYOUT_SCRIPT = `
(function () {
  try {
    var hasCoarsePointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    var maxTouchPoints =
      window.navigator && typeof window.navigator.maxTouchPoints === "number"
        ? window.navigator.maxTouchPoints
        : 0;
    var hasTouch = maxTouchPoints > 0 || "ontouchstart" in window;
    var isTouchLike = hasCoarsePointer || hasTouch;

    function isCompactDevice() {
      var screenWidth = window.screen && window.screen.width;
      var screenHeight = window.screen && window.screen.height;
      var viewportWidth = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 0;
      var viewportHeight = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || 0;
      var shortSide = Math.min(screenWidth || 0, screenHeight || 0);
      var pixelRatio = window.devicePixelRatio || 1;
      var isPhysicalScreen =
        (viewportWidth > 0 && (screenWidth || 0) > viewportWidth * 1.5) ||
        (viewportHeight > 0 && (screenHeight || 0) > viewportHeight * 1.5);
      var cssShortSide =
        isPhysicalScreen && pixelRatio > 1 ? shortSide / pixelRatio : shortSide;

      return (
        isTouchLike &&
        ((shortSide > 0 && shortSide < 600) ||
          (cssShortSide > 0 && cssShortSide < 600))
      );
    }

    function syncCompactDeviceLayout() {
      if (isCompactDevice()) {
        document.documentElement.dataset.compactDevice = "true";
      } else {
        delete document.documentElement.dataset.compactDevice;
      }
    }

    window[${JSON.stringify(COMPACT_DEVICE_SYNC_KEY)}] = syncCompactDeviceLayout;
    syncCompactDeviceLayout();

    if (isTouchLike) {
      window.addEventListener("resize", syncCompactDeviceLayout, {
        passive: true,
      });
      window.addEventListener("orientationchange", syncCompactDeviceLayout, {
        passive: true,
      });
    }
  } catch (_) {
  }
})();
`;

/**
 * 기기 판별 속성을 지금 기기 기준으로 다시 맞춘다. 클라이언트에서만 부른다.
 *
 * 하이드레이션 실패로 html 이 다시 그려지면 속성이 지워진다. 스크립트가 남긴 판별 함수를
 * 그대로 다시 불러 첫 페인트 때와 같은 기준으로 붙인다. 스크립트가 돌지 않은 환경에서는
 * 아무 일도 하지 않는다.
 */
export const syncCompactDeviceAttribute = () => {
  const sync = (window as unknown as Record<string, unknown>)[
    COMPACT_DEVICE_SYNC_KEY
  ];

  if (typeof sync === "function") {
    sync();
  }
};
