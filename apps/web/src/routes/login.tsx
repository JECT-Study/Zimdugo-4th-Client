import { BrandSymbolIcon, BrandTextLogoLarge } from "@repo/ui/tokens/icons";
import { createFileRoute, redirect, useSearch } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import {
  loginLogoInlineFallbackStyle,
  loginPageInlineFallbackStyle,
  loginStackInlineFallbackStyle,
} from "#/features/auth/sign-in/ui/login-page-fallback";
import { SocialLoginStack } from "#/features/auth/sign-in/ui/social-login-stack/SocialLoginStack";
import { useLoginPageStyleReady } from "#/features/auth/sign-in/ui/useLoginPageStyleReady";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { useAuthStore } from "#/shared/store/authStore";
import { loginStack, logo, page } from "./-login.css.ts";

export const Route = createFileRoute("/login")({
  head: createNoIndexNoFollowHead,
  beforeLoad: ({ search }) => {
    // 이미 로그인된 사용자가 명시적으로 /login에 접근하면 리다이렉트
    // SSR 환경에서는 Zustand persist(로컬스토리지/쿠키) 상태를 서버에서 즉시 읽기 어려우므로 일단 가드를 통과시킵니다.
    // TODO: 추후 2번 방식(HttpOnly 쿠키 직접 확인) 적용 시, 서버(SSR) 컨텍스트에서 헤더를 읽어 isAuthenticated를 판단하도록 개선 필요
    if (
      typeof window !== "undefined" &&
      useAuthStore.getState().isAuthenticated
    ) {
      let safePath = (search as Record<string, any>).returnPath as
        | string
        | undefined;
      if (
        !safePath ||
        !safePath.startsWith("/") ||
        safePath.startsWith("//") ||
        safePath.includes("://")
      ) {
        safePath = "/";
      }
      throw redirect({
        to: safePath,
        replace: true,
      });
    }
  },
  component: LoginPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { returnPath: string; code?: string } => {
    const returnPath = (search.returnPath as string) || "/";
    const code = search.code as string | undefined;

    return code ? { returnPath, code } : { returnPath };
  },
});

const symbolFrameStyle = {
  width: "90px",
  height: "90px",
  transform: "rotate(-18.64deg)",
  aspectRatio: "1 / 1",
} satisfies CSSProperties;

const symbolSlotStyle = {
  width: "114px",
  height: "114px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} satisfies CSSProperties;

const wordmarkStyle = {
  display: "block",
  width: "158px",
  height: "28px",
} satisfies CSSProperties;

function LoginPage() {
  const { code, returnPath } = useSearch({ from: "/login" });
  const { isStyleReady, isStyleTimedOut } = useLoginPageStyleReady();

  // 소셜 로그인 콜백으로 돌아온 경우, UI를 숨겨 화면 깜빡임 방지 (Hydration 에러 방지를 위해 구조는 유지)
  const isProcessing = !!code;

  if (isProcessing) {
    return (
      <div
        className={page}
        style={{
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        <LoginPageContent applyFallbackStyle={false} returnPath={returnPath} />
      </div>
    );
  }

  // VE CSS 아직 미적용: 인라인 fallback 스타일로 즉시 렌더링해 skeleton 컴포넌트 없이 레이아웃 유지
  const applyFallbackStyle = !isStyleReady || isStyleTimedOut;

  return (
    <div
      className={page}
      style={applyFallbackStyle ? loginPageInlineFallbackStyle : undefined}
    >
      <LoginPageContent
        applyFallbackStyle={applyFallbackStyle}
        returnPath={returnPath}
      />
    </div>
  );
}

function LoginPageContent({
  applyFallbackStyle,
  returnPath,
}: {
  applyFallbackStyle: boolean;
  returnPath: string;
}) {
  return (
    <>
      <div
        className={logo}
        style={applyFallbackStyle ? loginLogoInlineFallbackStyle : undefined}
      >
        <div style={symbolSlotStyle}>
          <div style={symbolFrameStyle}>
            <BrandSymbolIcon width={90} height={90} />
          </div>
        </div>
        <div style={wordmarkStyle}>
          <BrandTextLogoLarge />
        </div>
      </div>
      <SocialLoginStack
        className={loginStack}
        returnPath={returnPath}
        stackFallbackStyle={
          applyFallbackStyle ? loginStackInlineFallbackStyle : undefined
        }
        applyFallbackStyle={applyFallbackStyle}
      />
    </>
  );
}
