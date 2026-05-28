import { apiClient } from "#/shared/lib/apiClient";
import { useAuthStore } from "#/shared/store/authStore";

let refreshPromise: Promise<{ accessToken: string; userId: number | null; email: string | null; provider: string | null }> | null = null;

export const authService = {
  refresh: async () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const response = await apiClient.post("/api/auth/refresh");
        
        // 1. 공통 응답 포맷(RestResponse)에서 실제 데이터 객체 추출
        let authData = response.data?.data ? response.data.data : response.data;
        if (typeof authData === "string") {
          authData = { accessToken: authData };
        }

        const accessToken = authData.accessToken;
        if (!accessToken) {
          throw new Error("No access token received from refresh endpoint");
        }

        // Token 갱신 응답에 포함된 userId 및 email 정보를 활용하여
        // 추가적인 사용자 정보 조회 API(/api/v1/me) 호출을 생략함
        const userId = authData.userId || authData.id || null;
        const email = authData.email || null;

        // 2. email 주소 또는 응답 데이터를 기반으로 OAuth 제공자(Provider) 식별
        let provider = authData.provider || authData.oauthProvider || null;
        if (!provider && email) {
          const lowerEmail = email.toLowerCase();
          if (lowerEmail.endsWith("@gmail.com")) provider = "google";
          else if (lowerEmail.endsWith("@naver.com")) provider = "naver";
          else if (lowerEmail.endsWith("@kakao.com") || lowerEmail.endsWith("@daum.net")) provider = "kakao";
        }

        // 3. 클라이언트 상태 관리에 저장할 최종 인증 데이터 반환
        return {
          accessToken,
          userId,
          email,
          provider,
        };
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error("토큰 갱신 또는 유저 정보 조회 실패:", {
            message: error?.message,
            status: error?.response?.status,
          });
        }
        // 오류 발생 시 기존 인증 상태 초기화
        useAuthStore.getState().clearAuth();
        throw new Error(error?.response?.data?.message || error?.message || "Unknown auth refresh error");
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  logout: async () => {
    await apiClient.post("/api/auth/logout");
    useAuthStore.getState().clearAuth();
  },

  withdraw: async () => {
    await apiClient.post("/api/auth/withdraw");
    useAuthStore.getState().clearAuth();
  },
};
