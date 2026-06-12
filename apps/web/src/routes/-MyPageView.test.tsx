// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MyPageView } from "./-MyPageView";

const renderView = (
  props: Partial<React.ComponentProps<typeof MyPageView>> = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MyPageView
        nickname="여정이"
        profileImageUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        favoriteCount={12}
        reportCount={3}
        onBack={vi.fn()}
        onProfileImagePress={vi.fn()}
        onFileChange={vi.fn()}
        onNicknameChange={vi.fn()}
        onNicknameBlur={vi.fn()}
        onFavoritesPress={vi.fn()}
        onReportsPress={vi.fn()}
        onLogout={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
};

describe("MyPageView", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(cleanup);

  it("더미 프로필과 활동 카운트를 표시한다", () => {
    renderView();

    expect(screen.getByDisplayValue("여정이")).toBeTruthy();
    expect(screen.getByRole("img", { name: "프로필 이미지" })).toBeTruthy();
    expect(screen.getByText("12개")).toBeTruthy();
    expect(screen.getByText("3건")).toBeTruthy();
  });

  it("프로필 사진이 없어도 활동 카운트를 표시한다", () => {
    renderView({
      profileImageUrl: undefined,
      favoriteCount: 0,
      reportCount: 0,
    });

    expect(screen.queryByRole("img", { name: "프로필 이미지" })).toBeNull();
    expect(screen.getByDisplayValue("여정이")).toBeTruthy();
    expect(screen.getByText("0개")).toBeTruthy();
    expect(screen.getByText("0건")).toBeTruthy();
  });
});
