import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "#/shared/store/authStore";
import { useAuth } from "#/shared/hooks/useAuth";
import { Button } from "@repo/ui/components/button";

export const Route = createFileRoute("/my")({
  beforeLoad: ({ location, preload }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      if (typeof window !== "undefined" && !preload) {
        import("#/shared/store/authPopupStore").then(m => 
          m.useAuthPopupStore.getState().openPopup(location.pathname)
        );
      }
      throw redirect({
        to: "/",
        replace: true,
      });
    }
  },
  component: MyPageDummy,
});

function MyPageDummy() {
  const { logout } = useAuth();
  const { email, provider } = useAuthStore();

  return (
    <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h1>임시 마이페이지 (Auth 테스트용)</h1>
      <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", width: "100%", maxWidth: "400px" }}>
        <p><strong>Provider:</strong> {provider ?? "Unknown"}</p>
        <p><strong>Email:</strong> {email ?? "No Email"}</p>
      </div>
      <Button onClick={() => logout()}>로그아웃</Button>
    </div>
  );
}
