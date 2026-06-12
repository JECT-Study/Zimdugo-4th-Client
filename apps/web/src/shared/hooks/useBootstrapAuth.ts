import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { authService } from "../../features/auth/sign-in/api/authService";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import {
  LOCKER_KEYWORD_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "#/features/search/hooks/useSearch";
import { useAuthStore } from "#/shared/store/authStore";

export const useBootstrapAuth = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 이전에 로그인 성공하여 isAuthenticated가 true인 경우에만
    // 페이지 새로고침 시 refresh 토큰을 사용해 세션 복구 시도
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return;

    const bootstrap = async () => {
      try {
        const authData = await authService.refresh();
        useAuthStore.getState().setAuth(authData);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [LOCKER_DETAIL_QUERY_KEY],
          }),
          queryClient.invalidateQueries({
            queryKey: [LOCKER_KEYWORD_QUERY_KEY],
          }),
          queryClient.invalidateQueries({
            queryKey: [PLACE_LOCKERS_QUERY_KEY],
          }),
        ]);
      } catch (error) {
        useAuthStore.getState().clearAuth();
      }
    };

    bootstrap();
  }, [queryClient]);
};
