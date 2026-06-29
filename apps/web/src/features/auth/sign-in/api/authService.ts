import { apiClient } from "#/shared/lib/apiClient";
import { useAuthStore } from "#/shared/store/authStore";

interface RefreshedAuthData {
  accessToken: string;
  userId: number;
  email: string | null;
  provider: string | null;
}

interface RefreshResponseData {
  accessToken?: string;
  userId?: number | string;
  id?: number | string;
  email?: string;
  provider?: string;
  oauthProvider?: string;
}

interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      code?: string;
      message?: string;
    };
  };
}

let refreshPromise: Promise<RefreshedAuthData> | null = null;

const getProvider = (authData: RefreshResponseData, email: string | null) => {
  const provider = authData.provider ?? authData.oauthProvider;
  if (provider || !email) {
    return provider ?? null;
  }

  const lowerEmail = email.toLowerCase();
  if (lowerEmail.endsWith("@gmail.com")) return "google";
  if (lowerEmail.endsWith("@naver.com")) return "naver";
  if (lowerEmail.endsWith("@kakao.com") || lowerEmail.endsWith("@daum.net")) {
    return "kakao";
  }

  return null;
};

const getRefreshResponseData = (responseData: unknown): RefreshResponseData => {
  if (typeof responseData === "string") {
    return { accessToken: responseData };
  }

  if (typeof responseData !== "object" || responseData == null) {
    return {};
  }

  const wrappedResponse = responseData as {
    data?: RefreshResponseData;
  };
  return wrappedResponse.data ?? (responseData as RefreshResponseData);
};

const getApiErrorResponse = (error: unknown): ApiErrorResponse => {
  if (typeof error !== "object" || error == null) {
    return {};
  }

  return error as ApiErrorResponse;
};

const isAlreadyWithdrawnError = (error: unknown): boolean =>
  getApiErrorResponse(error).response?.data?.code === "USER-400-2";

export const authService = {
  refresh: async () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const response = await apiClient.post("/api/auth/refresh");
        const authData = getRefreshResponseData(response.data);
        const accessToken = authData.accessToken;

        if (!accessToken) {
          throw new Error("No access token received from refresh endpoint");
        }

        const userId = Number(authData.userId ?? authData.id);
        if (!Number.isInteger(userId) || userId <= 0) {
          throw new Error("Valid user id is required from refresh endpoint");
        }

        const email = authData.email ?? null;

        return {
          accessToken,
          userId,
          email,
          provider: getProvider(authData, email),
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown auth refresh error";
        const errorResponse = getApiErrorResponse(error);
        const responseMessage = errorResponse.response?.data?.message;

        if (import.meta.env.DEV) {
          console.error("토큰 갱신 또는 사용자 정보 조회 실패:", {
            message: errorMessage,
            status: errorResponse.response?.status,
          });
        }

        useAuthStore.getState().clearAuth();
        throw new Error(responseMessage || errorMessage);
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
    try {
      await apiClient.post("/api/auth/withdraw");
    } catch (error: unknown) {
      if (!isAlreadyWithdrawnError(error)) {
        throw error;
      }
    }

    useAuthStore.getState().clearAuth();
  },
};
