import { useEffect, useState } from "react";
import { logo } from "#/routes/-login.css.ts";
import { naver } from "#/features/auth/sign-in/ui/social-login-stack/SocialLoginStack.css.ts";

const STYLE_READY_CHECK_LIMIT = 20;

const isLoginLogoStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return style.position === "absolute" && style.display === "flex";
};

const isLoginButtonStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return style.height === "48px" && style.display === "flex";
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
    let checkCount = 0;

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

    const checkStyleReady = () => {
      if (
        isLoginLogoStyleReady(logoProbe) &&
        isLoginButtonStyleReady(buttonProbe)
      ) {
        setIsStyleReady(true);
        return;
      }

      if (checkCount >= STYLE_READY_CHECK_LIMIT) {
        setIsStyleTimedOut(true);
        setIsStyleReady(true);
        return;
      }

      checkCount += 1;
      frameId = window.requestAnimationFrame(checkStyleReady);
    };

    frameId = window.requestAnimationFrame(checkStyleReady);

    return () => {
      window.cancelAnimationFrame(frameId);
      logoProbe.remove();
      buttonProbe.remove();
    };
  }, []);

  return { isStyleReady, isStyleTimedOut };
}
