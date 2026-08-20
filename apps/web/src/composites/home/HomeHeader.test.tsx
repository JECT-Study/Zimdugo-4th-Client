import { m } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeHeader } from "./HomeHeader";

const renderHeader = (profileImageUrl = "") => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <HomeHeader profileImageUrl={profileImageUrl} onProfilePress={vi.fn()} />
    </QueryClientProvider>,
  );
};

describe("HomeHeader", () => {
  it("사진이 없으면 홈 전용 프로필 아이콘을 표시한다", () => {
    renderHeader();

    const profileButton = screen.getByRole("button", {
      name: m.my_profile_aria(),
    });

    expect(profileButton.querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("img", { name: m.my_profile_image_alt() })).toBe(
      null,
    );
  });

  it("사진이 있으면 ProfileImage로 전달해 표시한다", () => {
    const profileImageUrl = "https://example.com/profile.jpg";
    renderHeader(profileImageUrl);

    const profileImage = screen.getByRole("img", {
      name: m.my_profile_image_alt(),
    });
    expect(profileImage.getAttribute("src")).toBe(profileImageUrl);
  });

  it("헤더 아이콘을 인라인 SVG 로 그린다", () => {
    const { container } = renderHeader();

    // new URL(..., import.meta.url) 로 만든 <img> 자산은 서버 번들에서 치환되지
    // 않아 프리렌더된 HTML 에 file:// 경로가 박히고 초기 진입에서 깨진다.
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });
});
