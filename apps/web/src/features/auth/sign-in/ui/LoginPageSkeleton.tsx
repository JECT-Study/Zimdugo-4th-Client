import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { CSSProperties } from "react";
import {
  LOGIN_BUTTON_HEIGHT_PX,
  LOGIN_BUTTON_RADIUS_PX,
  LOGIN_LOGO_WIDTH_PX,
  loginLogoInlineFallbackStyle,
  loginPageSkeletonInlineFallbackStyle,
  loginStackSkeletonInlineFallbackStyle,
} from "#/features/auth/sign-in/ui/login-page-fallback";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { loginStack, logo, page } from "#/routes/-login.css.ts";

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;

/**
 * 로그인 페이지 로딩 스켈레톤.
 * vanilla-extract CSS 청크 도착 전에도 로고·소셜 버튼 자리를 잡는다.
 */
export function LoginPageSkeleton() {
  return (
    <div
      className={page}
      style={loginPageSkeletonInlineFallbackStyle}
      aria-hidden="true"
    >
      <div className={logo} style={loginLogoInlineFallbackStyle}>
        <Skeleton
          width={114}
          height={114}
          borderRadius={9999}
          variant="rect"
          style={skeletonSurfaceStyle}
        />
        <Skeleton
          width={LOGIN_LOGO_WIDTH_PX}
          height={28}
          borderRadius={8}
          variant="rect"
          style={skeletonSurfaceStyle}
        />
      </div>
      <div className={loginStack} style={loginStackSkeletonInlineFallbackStyle}>
        {(["naver", "kakao", "google"] as const).map((provider) => (
          <Skeleton
            key={provider}
            width="100%"
            height={LOGIN_BUTTON_HEIGHT_PX}
            borderRadius={LOGIN_BUTTON_RADIUS_PX}
            variant="rect"
            style={skeletonSurfaceStyle}
          />
        ))}
      </div>
    </div>
  );
}
