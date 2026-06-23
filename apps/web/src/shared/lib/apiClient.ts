import { createApiClient, createApiMethods } from "@repo/libs/axios";
import type { InternalAxiosRequestConfig } from "axios";
import { resolveAcceptLanguageHeader } from "#/shared/i18n/api-locale";
import { useAuthStore } from "#/shared/store/authStore";
import { authService } from "#/features/auth/sign-in/api/authService";

const getBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // 서버 사이드 실행 (Node.js / Nitro) 환경
    if (typeof process !== "undefined" && process.env) {
      if (process.env.VITE_API_BASE_URL) return process.env.VITE_API_BASE_URL;
      if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
    }
  } else {
    // 클라이언트 사이드 (브라우저) 환경
    if (import.meta.env?.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  }
  // 기본 백엔드 API 도메인 (Fallback)
  return "https://api.zimdugo.com";
};

export const apiClient = createApiClient(getBaseUrl());
apiClient.defaults.withCredentials = true;

const getRequestUrl = (config: InternalAxiosRequestConfig): string => {
  const requestPath = config.url ?? "";
  if (/^https?:\/\//i.test(requestPath)) {
    return requestPath;
  }

  const baseURL = config.baseURL ?? "";
  if (!baseURL) {
    return requestPath;
  }

  if (baseURL.endsWith("/") && requestPath.startsWith("/")) {
    return `${baseURL.slice(0, -1)}${requestPath}`;
  }

  if (!baseURL.endsWith("/") && !requestPath.startsWith("/")) {
    return `${baseURL}/${requestPath}`;
  }

  return `${baseURL}${requestPath}`;
};

apiClient.interceptors.request.use((config) => {
  const acceptLanguage = resolveAcceptLanguageHeader(getRequestUrl(config));
  if (acceptLanguage) {
    config.headers.set("Accept-Language", acceptLanguage);
  }

  const token = useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      typeof originalRequest.url === "string" &&
      !originalRequest.url.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const authData = await authService.refresh();
        useAuthStore.getState().setAuth(authData);
        originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  },
);

export const { httpGet, httpPost, httpPut, httpPatch, httpDelete } =
  createApiMethods(apiClient);
