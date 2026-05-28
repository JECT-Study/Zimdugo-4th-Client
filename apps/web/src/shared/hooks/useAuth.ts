import { useNavigate } from "@tanstack/react-router";
import { authService } from "../../features/auth/sign-in/api/authService";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, email, userId } = useAuthStore();

  const login = (provider: "naver" | "kakao" | "google", returnPath?: string) => {
    const callbackUrl = returnPath || "/";
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ??
      (import.meta.env.DEV ? "http://localhost:8080" : "");
    const absoluteCallbackUrl = `${window.location.origin}${callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`}`;
    window.location.href = `${baseUrl}/oauth2/authorization/${provider}?callbackUrl=${encodeURIComponent(absoluteCallbackUrl)}`;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate({ to: "/", replace: true });
    }
  };

  return { isAuthenticated, email, userId, login, logout };
};
