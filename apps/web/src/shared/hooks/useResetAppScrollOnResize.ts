import { useEffect } from "react";

const isEditableElement = (element: Element | null) => {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable) return true;

  const tagName = element.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
};

/**
 * 앱 화면에서 뷰포트가 바뀐 뒤 문서에 남은 스크롤을 0 으로 되돌린다.
 *
 * 앱 화면은 `html, body` 가 `overflow: hidden` 이라 문서가 스크롤될 일이 없다.
 * 그런데 iOS 홈 화면 앱(PWA)은 가로에서 세로로 돌아올 때 상태 표시줄까지 덮는
 * 높이(874)로 한 번 커졌다가 실제 높이(812)로 줄어들고, 그 차이만큼 문서가
 * 스크롤된 채 남는다. 화면 전체가 그만큼 위로 밀려 헤더가 상태 표시줄 밑으로
 * 들어가고, 바닥에는 빈 띠가 생긴다.
 *
 * 입력칸에 포커스가 있으면 건드리지 않는다. 키보드가 올라올 때 iOS 가 입력칸을
 * 보이게 하려고 문서를 올리는데, 그것까지 되돌리면 입력칸이 키보드에 가려진다.
 */
export const useResetAppScrollOnResize = (isEnabled: boolean) => {
  useEffect(() => {
    if (!isEnabled) return;

    let frameId = 0;

    const resetScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (window.scrollY === 0 && window.scrollX === 0) return;
        if (isEditableElement(document.activeElement)) return;

        window.scrollTo(0, 0);
      });
    };

    window.addEventListener("resize", resetScroll);
    window.addEventListener("orientationchange", resetScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resetScroll);
      window.removeEventListener("orientationchange", resetScroll);
    };
  }, [isEnabled]);
};
