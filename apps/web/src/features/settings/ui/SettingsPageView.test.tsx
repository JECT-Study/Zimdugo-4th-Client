// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPageView } from "./SettingsPageView";

const renderView = ({ isAuthenticated = true } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const profile = {
    isGuest: !isAuthenticated,
    nickname: isAuthenticated ? "여정이" : "로그인이 필요합니다",
    profileImageUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
    onProfileImagePress: vi.fn(),
    onProfileImageEditPress: vi.fn(),
    onFileChange: vi.fn(),
    onNicknameChange: vi.fn(),
    onNicknameBlur: vi.fn(),
    onFavoritesPress: vi.fn(),
    onReportsPress: vi.fn(),
    onLogout: vi.fn(),
  };

  return {
    ...render(
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
    ),
    profile,
  };
};

describe("SettingsPageView", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(cleanup);

  it("로그인 사용자에게 프로필, 활동, 설정을 함께 표시한다", () => {
    const { profile } = renderView();

    expect(screen.getByDisplayValue("여정이")).toBeTruthy();
    expect(screen.getByTitle("수정")).toBeTruthy();
    expect(screen.getByRole("button", { name: "즐겨찾기" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "제보 히스토리" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "언어 설정" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "프로필 이미지" }));
    expect(profile.onProfileImagePress).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "프로필 사진 변경" }));
    expect(profile.onProfileImageEditPress).toHaveBeenCalledOnce();
  });

  it("비로그인 사용자에게 공용 설정만 표시한다", () => {
    const { profile } = renderView({ isAuthenticated: false });

    expect(screen.getByLabelText("프로필")).toBeTruthy();
    expect(screen.getByDisplayValue("로그인이 필요합니다")).toBeTruthy();
    expect(screen.queryByTitle("수정")).toBeNull();
    expect(screen.queryByRole("button", { name: "즐겨찾기" })).toBeNull();
    expect(screen.queryByRole("button", { name: "제보 히스토리" })).toBeNull();
    expect(screen.getByRole("button", { name: "언어 설정" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "회원탈퇴" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "로그인하기" }));
    expect(profile.onProfileImagePress).toHaveBeenCalledOnce();
  });
});
