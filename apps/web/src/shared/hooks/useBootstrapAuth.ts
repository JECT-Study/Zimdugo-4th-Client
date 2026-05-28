import { useEffect } from "react";
import { authService } from "../../features/auth/sign-in/api/authService";
import { useAuthStore } from "../store/authStore";

export const useBootstrapAuth = () => {
  useEffect(() => {
    // 이전에 로그인 성공하여 isAuthenticated가 true인 경우에만 
    // 페이지 새로고침 시 refresh 토큰을 사용해 세션 복구 시도
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return;

    const bootstrap = async () => {
      try {
        const authData = await authService.refresh();
        useAuthStore.getState().setAuth(authData);
      } catch (error) {
        useAuthStore.getState().clearAuth();
      }
    };

    bootstrap();
  }, []);
};
