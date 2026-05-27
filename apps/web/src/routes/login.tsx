import { useEffect, type CSSProperties } from "react";
import { createFileRoute, useSearch, redirect } from "@tanstack/react-router";
import { BrandSymbolIcon, BrandTextLogoLarge } from "@repo/ui/tokens/icons";
import { SocialLoginStack } from "#/features/auth/sign-in/ui/social-login-stack/SocialLoginStack";
import { LoginResultModal } from "#/features/auth/sign-in/ui/LoginResultModal";
import { useAuthStore } from "#/shared/store/authStore";
import { loginStack, logo, page } from "./-login.css.ts";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ search }) => {
    // 이미 로그인된 사용자가 명시적으로 /login에 접근하면 리다이렉트
    // (단, OAuth 콜백 중에는 아직 isAuthenticated가 갱신되기 전이므로 통과됨)
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({
        to: (search as any).returnPath || "/",
        replace: true,
      });
    }
  },
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    returnPath: (search.returnPath as string) || "/",
    code: search.code as string | undefined,
  }),
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
  const { returnPath } = useSearch({ from: "/login" });

  return (
    <div className={page}>
      <LoginResultModal />
      <div className={logo}>
        <div style={symbolSlotStyle}>
          <div style={symbolFrameStyle}>
            <BrandSymbolIcon width={90} height={90} />
          </div>
        </div>
        <div style={wordmarkStyle}>
          <BrandTextLogoLarge />
        </div>
      </div>
      <SocialLoginStack className={loginStack} showEnglishLabel />
    </div>
  );
}
