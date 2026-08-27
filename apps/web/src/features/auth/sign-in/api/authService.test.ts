import { beforeEach, describe, expect, it, vi } from "vitest";

const { clearAuth, httpPost } = vi.hoisted(() => ({
  clearAuth: vi.fn(),
  httpPost: vi.fn(),
}));

vi.mock("#/shared/lib/apiClient", () => ({
  httpPost,
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
    httpPost.mockReset();
    clearAuth.mockReset();
  });

  it("refresh 응답에서 사용자 정보를 복원한다", async () => {
    httpPost.mockResolvedValue({
      data: {
        accessToken: "access-token",
        userId: "42",
        email: "traveler@gmail.com",
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
    httpPost.mockResolvedValue({
      accessToken: "access-token",
    });

    await expect(authService.refresh()).rejects.toThrow(
      "Valid user id is required from refresh endpoint",
    );
    expect(clearAuth).toHaveBeenCalledOnce();
  });
});

describe("authService.withdraw", () => {
  beforeEach(() => {
    httpPost.mockReset();
    clearAuth.mockReset();
  });

  it("회원탈퇴 엔드포인트 호출 후 인증 상태를 제거한다", async () => {
    httpPost.mockResolvedValue({});

    await expect(authService.withdraw()).resolves.toBeUndefined();

    expect(httpPost).toHaveBeenCalledWith("/api/auth/withdraw");
    expect(clearAuth).toHaveBeenCalledOnce();
  });

  it("이미 탈퇴한 사용자 응답은 성공처럼 처리하고 인증 상태를 제거한다", async () => {
    httpPost.mockRejectedValue({
      response: {
        status: 400,
        data: {
          code: "USER-400-2",
          message: "이미 탈퇴한 사용자입니다.",
        },
      },
    });

    await expect(authService.withdraw()).resolves.toBeUndefined();

    expect(clearAuth).toHaveBeenCalledOnce();
  });
});
