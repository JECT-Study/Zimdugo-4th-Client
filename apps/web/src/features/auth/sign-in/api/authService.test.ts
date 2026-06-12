import { beforeEach, describe, expect, it, vi } from "vitest";

const { clearAuth, post } = vi.hoisted(() => ({
  clearAuth: vi.fn(),
  post: vi.fn(),
}));

vi.mock("#/shared/lib/apiClient", () => ({
  apiClient: {
    post,
  },
}));

vi.mock("#/shared/store/authStore", () => ({
  useAuthStore: {
    getState: () => ({
      clearAuth,
    }),
  },
}));

import { authService } from "./authService";

describe("authService.refresh", () => {
  beforeEach(() => {
    post.mockReset();
    clearAuth.mockReset();
  });

  it("refresh 응답에서 사용자 정보를 복원한다", async () => {
    post.mockResolvedValue({
      data: {
        data: {
          accessToken: "access-token",
          userId: "42",
          email: "traveler@gmail.com",
        },
      },
    });

    await expect(authService.refresh()).resolves.toEqual({
      accessToken: "access-token",
      userId: 42,
      email: "traveler@gmail.com",
      provider: "google",
    });
    expect(clearAuth).not.toHaveBeenCalled();
  });

  it("사용자 ID가 없는 refresh 응답은 인증 상태를 제거한다", async () => {
    post.mockResolvedValue({
      data: {
        accessToken: "access-token",
      },
    });

    await expect(authService.refresh()).rejects.toThrow(
      "Valid user id is required from refresh endpoint",
    );
    expect(clearAuth).toHaveBeenCalledOnce();
  });
});
