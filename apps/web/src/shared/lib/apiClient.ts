import { createApiClient } from "@repo/libs/axios";
import { useAuthStore } from "#/shared/store/authStore";
import { authService } from "#/features/auth/sign-in/api/authService";

export const apiClient = createApiClient(
  import.meta.env.VITE_API_BASE_URL ?? "",
);
apiClient.defaults.withCredentials = true;

apiClient.interceptors.request.use((config) => {
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
      !originalRequest._retry &&
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
