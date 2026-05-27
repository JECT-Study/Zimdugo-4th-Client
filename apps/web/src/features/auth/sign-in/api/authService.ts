import { apiClient } from "#/shared/lib/apiClient";
import { useAuthStore } from "#/shared/store/authStore";

export const authService = {
  refresh: async () => {
    try {
      const response = await apiClient.post("/api/auth/refresh");
      console.log("🔒 Refresh Response Data:", response.data);
      
      // 1. 토큰 추출 (래핑된 경우 껍데기 벗기기)
      let authData = response.data?.data ? response.data.data : response.data;
      if (typeof authData === "string") {
        authData = { accessToken: authData };
      }

      const accessToken = authData.accessToken;
      if (!accessToken) {
        throw new Error("No access token received from refresh endpoint");
      }

      // 2. 발급받은 토큰으로 즉시 /api/v1/me API 호출하여 유저 정보 획득
      // (무한 루프 방지를 위해 _retry: true 강제 주입)
      const userResponse = await apiClient.get("/api/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        ...({ _retry: true } as any)
      });
      
      const userData = userResponse.data?.data ? userResponse.data.data : userResponse.data;

      // 4. 이메일이나 제공된 속성을 통해 OAuth 제공자 유추
      let provider = userData.provider || userData.oauthProvider || null;
      if (!provider && userData.email) {
        if (userData.email.includes("gmail.com")) provider = "google";
        else if (userData.email.includes("naver.com")) provider = "naver";
        else if (userData.email.includes("kakao.com") || userData.email.includes("daum.net")) provider = "kakao";
      }

      // 5. 상태 저장소 저장을 위한 최종 객체 반환
      return {
        accessToken,
        userId: userData.userId ?? userData.id,
        email: userData.email,
        provider,
      };
    } catch (error) {
      console.error("토큰 갱신 또는 유저 정보 조회 실패:", error);
      // 에러 시 기존 인증 정보 완벽하게 파기
      useAuthStore.getState().clearAuth();
      throw error;
    }
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
