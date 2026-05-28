import { createFileRoute, redirect } from "@tanstack/react-router";
import { vars } from "@repo/ui/vars";
import { useAuthStore } from "#/shared/store/authStore";
import { useAuth } from "#/shared/hooks/useAuth";
import { Button } from "@repo/ui/components/button";

import { IconGoogle24, IconKakao24, IconNaver19 } from "@repo/ui/tokens/icons";

export const Route = createFileRoute("/my")({
  beforeLoad: ({ location, preload }) => {
    // TODO: 추후 2번 방식(HttpOnly 쿠키 직접 확인) 적용 시, 서버(SSR) 컨텍스트에서 헤더를 읽어 isAuthenticated를 판단하도록 개선 필요
    if (typeof window !== "undefined" && !useAuthStore.getState().isAuthenticated) {
      if (!preload) {
        // 실제 네비게이션 시에만 로그인 팝업을 띄우기 위한 전역 상태 갱신
        import("#/shared/store/authPopupStore").then(m => 
          m.useAuthPopupStore.getState().openPopup(location.pathname)
        );
      }
      // 로그인 페이지로 강제 납치하지 않고 메인 화면("/")으로 돌려보낸 뒤 팝업을 띄움
      throw redirect({
        to: "/",
        replace: true,
      });
    }
  },
  component: MyPage,
});

function MyPage() {
  const { logout } = useAuth();
  const { userId, email, provider } = useAuthStore();

  let currentProvider = provider;
  if (!currentProvider && email) {
    if (email.includes("gmail.com")) currentProvider = "google";
    else if (email.includes("naver.com")) currentProvider = "naver";
    else if (email.includes("kakao.com") || email.includes("daum.net")) currentProvider = "kakao";
  }

  const ProviderIcon = 
    currentProvider === "google" ? IconGoogle24 : 
    currentProvider === "naver" ? IconNaver19 : 
    currentProvider === "kakao" ? IconKakao24 : null;

  const providerColor = 
    currentProvider === "google" ? "#1775f8" :
    currentProvider === "naver" ? "#04c65b" :
    currentProvider === "kakao" ? "#ffe400" : "transparent";

  return (
    <div
      style={{
        padding: "24px",
        height: "100%",
        backgroundColor: vars.color.bg.default,
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        마이페이지 (준비 중)
      </h1>
      <p style={{ marginTop: "16px", color: vars.color.text.secondary }}>
        로그인이 완료된 사용자만 볼 수 있는 화면입니다.
      </p>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: vars.color.bg.elevated,
          borderRadius: "8px",
          border: `1px solid ${vars.color.border.default}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px", gap: "8px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>
            내 정보
          </h2>
          {ProviderIcon && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: providerColor,
              }}
            >
              <ProviderIcon />
            </div>
          )}
        </div>
        <div style={{ fontSize: "14px", color: vars.color.text.primary, lineHeight: "1.5" }}>
          <div><strong>ID:</strong> {userId ?? "알 수 없음"}</div>
          <div><strong>이메일:</strong> {email ?? "이메일 정보 없음"}</div>
        </div>
      </div>
      
      <div style={{ marginTop: "32px" }}>
        <Button 
          variant="outline" 
          intent="neutral" 
          onPress={() => logout()}
        >
          로그아웃
        </Button>
      </div>
    </div>
  );
}
