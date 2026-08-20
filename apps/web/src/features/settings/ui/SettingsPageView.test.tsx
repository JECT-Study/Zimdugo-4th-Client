// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import type { SocialProvider } from "@repo/ui/tokens/icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPageView } from "./SettingsPageView";

const renderView = ({ isAuthenticated = true } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const providers: SocialProvider[] = isAuthenticated ? ["google"] : [];
  const profile = {
    isGuest: !isAuthenticated,
    email: isAuthenticated ? "zimdugo@gmail.com" : "로그인이 필요한 기능입니다",
    providers,
    profileImageUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
    onProfileImagePress: vi.fn(),
    onProfileImageEditPress: vi.fn(),
    onFileChange: vi.fn(),
    onFavoritesPress: vi.fn(),
    onReportsPress: vi.fn(),
    onLogin: vi.fn(),
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

    const emailField = screen.getByRole("textbox", { name: "이메일" });
    expect(emailField.getAttribute("value")).toBe("zimdugo@gmail.com");
    expect(emailField.hasAttribute("readonly")).toBe(true);
    expect(
      document.querySelector('[data-social-provider="google"]'),
    ).toBeTruthy();
    expect(screen.getByTitle("수정")).toBeTruthy();
    expect(screen.getByRole("button", { name: "즐겨찾기" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "제보 히스토리" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "언어 설정" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "테마 설정" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "로그인" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "프로필 이미지" }));
    expect(profile.onProfileImagePress).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "프로필 사진 변경" }));
    expect(profile.onProfileImageEditPress).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    expect(profile.onLogout).toHaveBeenCalledOnce();
  });

  it("비로그인 사용자에게 공용 설정만 표시한다", () => {
    const { profile } = renderView({ isAuthenticated: false });

    expect(screen.getByLabelText("프로필")).toBeTruthy();
    expect(
      screen.getByRole("textbox", { name: "이메일" }).getAttribute("value"),
    ).toBe("로그인이 필요한 기능입니다");
    expect(screen.queryByTitle("수정")).toBeNull();
    expect(document.querySelector("[data-social-provider]")).toBeNull();
    expect(screen.queryByRole("button", { name: "즐겨찾기" })).toBeNull();
    expect(screen.queryByRole("button", { name: "제보 히스토리" })).toBeNull();
    expect(screen.getByRole("button", { name: "언어 설정" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "테마 설정" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "로그인" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "로그아웃" })).toBeNull();
    expect(screen.queryByRole("button", { name: "회원탈퇴" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "로그인하기" }));
    expect(profile.onProfileImagePress).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(profile.onLogin).toHaveBeenCalledOnce();
  });
});
