// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPageView } from "./SettingsPageView";

const renderView = ({ isAuthenticated = true } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const profile = isAuthenticated
    ? {
        nickname: "여정이",
        profileImageUrl:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
        favoriteCount: 12,
        reportCount: 3,
        onProfileImagePress: vi.fn(),
        onFileChange: vi.fn(),
        onNicknameChange: vi.fn(),
        onNicknameBlur: vi.fn(),
        onFavoritesPress: vi.fn(),
        onReportsPress: vi.fn(),
        onLogout: vi.fn(),
      }
    : undefined;

  return render(
    <QueryClientProvider client={queryClient}>
      <SettingsPageView
        profile={profile}
        appVersion="1.0.0"
        onBack={vi.fn()}
        onLanguagePress={vi.fn()}
        onNoticePress={vi.fn()}
        onTermsPress={vi.fn()}
        onPrivacyPress={vi.fn()}
        onWithdrawPress={isAuthenticated ? vi.fn() : undefined}
      />
    </QueryClientProvider>,
  );
};

describe("SettingsPageView", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(cleanup);

  it("로그인 사용자에게 프로필, 활동, 설정을 함께 표시한다", () => {
    renderView();

    expect(screen.getByDisplayValue("여정이")).toBeTruthy();
    expect(screen.getByText("12개")).toBeTruthy();
    expect(screen.getByText("3건")).toBeTruthy();
    expect(screen.getByRole("button", { name: "언어 설정" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();
  });

  it("비로그인 사용자에게 공용 설정만 표시한다", () => {
    renderView({ isAuthenticated: false });

    expect(screen.queryByLabelText("프로필")).toBeNull();
    expect(screen.getByRole("button", { name: "언어 설정" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "회원탈퇴" })).toBeNull();
  });
});
