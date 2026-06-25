import { createApiClient, createApiMethods } from "@repo/libs/axios";
import type { InternalAxiosRequestConfig } from "axios";
import { authService } from "#/features/auth/sign-in/api/authService";
import { resolveAcceptLanguageHeader } from "#/shared/i18n/api-locale";
import { useAuthStore } from "#/shared/store/authStore";
import {
  reportRuntimeConfigWarning,
  resolveApiBaseUrl,
  shouldBlockServerRelativeApiRequest,
} from "./api-base-url";

const getBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // 서버 사이드 실행 (Node.js / Nitro) 환경
    return resolveApiBaseUrl({
      isServer: true,
      env: typeof process !== "undefined" ? process.env : undefined,
    });
  }

  // 클라이언트 사이드 (브라우저) 환경
  if (import.meta.env?.VITE_API_BASE_URL) {
    return resolveApiBaseUrl({
      isServer: false,
      clientBaseUrl: import.meta.env.VITE_API_BASE_URL,
    });
  }

  // 클라이언트 환경 기본 상대 경로 fallback (API 래퍼들이 이미 /api를 포함하므로 빈 문자열 반환)
  return resolveApiBaseUrl({
    isServer: false,
  });
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
  if (
    shouldBlockServerRelativeApiRequest({
      isServer: typeof window === "undefined",
      baseUrl: config.baseURL,
      requestPath: config.url,
    })
  ) {
    reportRuntimeConfigWarning({
      code: "server_api_base_url_required",
      message:
        "Server API requests require API_BASE_URL or VITE_API_BASE_URL to be configured.",
      details: {
        path: config.url ?? "",
      },
    });
    throw new Error(
      "Server API request requires API_BASE_URL or VITE_API_BASE_URL.",
    );
  }

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
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  },
);

export const { httpGet, httpPost, httpPut, httpPatch, httpDelete } =
  createApiMethods(apiClient);
