/**
 * 상단 안전 영역 크기를 픽셀로 읽는다.
 *
 * 뷰포트에 `viewport-fit=cover` 를 걸어 둬서, 노치가 있는 기기는 화면 위쪽 일부가
 * 시스템 UI 에 덮인다. CSS 는 `env(safe-area-inset-top)` 으로 그만큼 비켜 서지만,
 * 스냅 지점처럼 JS 가 숫자로 계산하는 자리는 그 값을 알 방법이 없어 0 으로 가정해
 * 왔다. 그래서 CSS 로 배치한 요소와 JS 로 배치한 요소가 노치 기기에서만 어긋난다.
 *
 * 프로브를 하나 띄워 브라우저가 실제로 해석한 값을 받아 온다. 계산식을 두 벌로
 * 두면 기기별 값을 우리가 다시 추측하게 되므로 브라우저에게 묻는 편이 맞다.
 */
export const readSafeAreaInsetTopPx = () => {
  if (typeof document === "undefined") {
    return 0;
  }

  const probe = document.createElement("div");

  probe.style.position = "fixed";
  probe.style.top = "0";
  probe.style.left = "0";
  probe.style.width = "0";
  probe.style.height = "env(safe-area-inset-top, 0px)";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";

  document.body.appendChild(probe);
  const inset = probe.getBoundingClientRect().height;
  probe.remove();

  return Number.isFinite(inset) ? inset : 0;
};
