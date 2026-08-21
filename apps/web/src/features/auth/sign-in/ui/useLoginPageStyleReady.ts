import { useEffect, useState } from "react";
import { naver } from "#/features/auth/sign-in/ui/social-login-stack/SocialLoginStack.css.ts";
import { logo } from "#/routes/-login.css.ts";

const STYLE_READY_CHECK_LIMIT = 20;
const STYLE_RECHECK_INTERVAL_MS = 100;
const STYLE_RECHECK_LIMIT = 50;

const isLoginLogoStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return style.position === "absolute" && style.display === "flex";
};

const isLoginButtonStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  // 버튼은 subgrid를 쓰는 grid이고, subgrid 미지원 브라우저에서만 flex로 떨어진다.
  // display를 하나로 못 박으면 CSS가 적용됐는데도 probe가 실패해 폴백에 갇힌다.
  return (
    style.height === "48px" &&
    (style.display === "grid" || style.display === "flex")
  );
};

/**
 * 로그인 페이지 vanilla-extract CSS 적용 여부를 probe로 확인한다.
 * BottomTabBar와 동일한 rAF 폴링 패턴(로그인 화면은 탭바 미노출).
 */
export function useLoginPageStyleReady() {
  const [isStyleReady, setIsStyleReady] = useState(false);
  const [isStyleTimedOut, setIsStyleTimedOut] = useState(false);

  useEffect(() => {
    let frameId = 0;
    let timerId = 0;
    let checkCount = 0;
    let recheckCount = 0;

    const logoProbe = document.createElement("div");
    logoProbe.className = logo;
    logoProbe.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none";

    const buttonProbe = document.createElement("div");
    buttonProbe.className = naver;
    buttonProbe.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none";

    document.body.appendChild(logoProbe);
    document.body.appendChild(buttonProbe);

    const isStyleApplied = () =>
      isLoginLogoStyleReady(logoProbe) && isLoginButtonStyleReady(buttonProbe);

    // 타임아웃 뒤에도 CSS 청크는 늦게 도착할 수 있다. 계속 지켜보다가 도착하면
    // 폴백을 걷어내야 인라인 스타일이 실제 레이아웃을 덮은 채로 굳지 않는다.
    const recheckStyleReady = () => {
      if (isStyleApplied()) {
        setIsStyleTimedOut(false);
        return;
      }

      if (recheckCount >= STYLE_RECHECK_LIMIT) {
        return;
      }

      recheckCount += 1;
      timerId = window.setTimeout(recheckStyleReady, STYLE_RECHECK_INTERVAL_MS);
    };

    const checkStyleReady = () => {
      if (isStyleApplied()) {
        setIsStyleReady(true);
        return;
      }

      if (checkCount >= STYLE_READY_CHECK_LIMIT) {
        setIsStyleTimedOut(true);
        setIsStyleReady(true);
        timerId = window.setTimeout(
          recheckStyleReady,
          STYLE_RECHECK_INTERVAL_MS,
        );
        return;
      }

      checkCount += 1;
      frameId = window.requestAnimationFrame(checkStyleReady);
    };

    frameId = window.requestAnimationFrame(checkStyleReady);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
      logoProbe.remove();
      buttonProbe.remove();
    };
  }, []);

  return { isStyleReady, isStyleTimedOut };
}
