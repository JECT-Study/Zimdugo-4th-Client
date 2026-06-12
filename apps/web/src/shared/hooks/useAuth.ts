import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "../../features/auth/sign-in/api/authService";
import { removePersonalizedQueries } from "#/shared/lib/invalidate-personalized-queries";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, email, userId } = useAuthStore();

  const login = (provider: "naver" | "kakao" | "google", returnPath?: string) => {
    const callbackUrl = "/login";
    const query = returnPath ? `?returnPath=${encodeURIComponent(returnPath)}` : "";
    const absoluteCallbackUrl = `${window.location.origin}${callbackUrl}${query}`;
    
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ??
      (import.meta.env.DEV ? "http://localhost:8080" : "");
      
    window.location.href = `${baseUrl}/oauth2/authorization/${provider}?callbackUrl=${encodeURIComponent(absoluteCallbackUrl)}`;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      removePersonalizedQueries(queryClient);
      navigate({ to: "/", replace: true });
    }
  };

  return { isAuthenticated, email, userId, login, logout };
};
