import { m } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeHeader } from "./HomeHeader";
import * as styles from "./HomeHeader.css";

// vitest 에 globals 가 꺼져 있어 RTL 자동 정리가 걸리지 않는다. 직접 정리하지
// 않으면 앞선 테스트의 헤더가 body 에 남아 screen 질의가 중복으로 잡힌다.
afterEach(cleanup);

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

/**
 * 헤더는 CSS 청크가 붙기 전까지 스켈레톤을 보여준다. jsdom 에는 vanilla-extract
 * 스타일이 적용되지 않아 프로브가 항상 타임아웃으로 끝나므로, 실제 UI 를 보는
 * 단언은 프로브가 끝날 때까지 기다려야 한다.
 */
const findProfileButton = () =>
  screen.findByRole("button", { name: m.my_profile_aria() });

describe("HomeHeader", () => {
  it("스타일이 붙기 전에는 스켈레톤을 표시한다", () => {
    const { container } = renderHeader();

    expect(
      screen.queryByRole("button", { name: m.my_profile_aria() }),
    ).toBeNull();
    expect(
      container.querySelectorAll("[aria-hidden='true']").length,
    ).toBeGreaterThan(0);
  });

  it("사진이 없으면 홈 전용 프로필 아이콘을 표시한다", async () => {
    renderHeader();

    const profileButton = await findProfileButton();

    expect(profileButton.querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("img", { name: m.my_profile_image_alt() })).toBe(
      null,
    );
  });

  it("사진이 있으면 ProfileImage로 전달해 표시한다", async () => {
    const profileImageUrl = "https://example.com/profile.jpg";
    renderHeader(profileImageUrl);

    const profileImage = await screen.findByRole("img", {
      name: m.my_profile_image_alt(),
    });
    expect(profileImage.getAttribute("src")).toBe(profileImageUrl);
  });

  it("헤더 아이콘을 인라인 SVG 로 그린다", async () => {
    const { container } = renderHeader();
    await findProfileButton();

    // new URL(..., import.meta.url) 로 만든 <img> 자산은 서버 번들에서 치환되지
    // 않아 프리렌더된 HTML 에 file:// 경로가 박히고 초기 진입에서 깨진다.
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("언어 목록이 열린 동안에만 헤더를 바텀시트 위로 올린다", async () => {
    const { container } = renderHeader();
    const trigger = await screen.findByRole("button", {
      name: m.settings_language(),
    });
    const header = container.querySelector("header");

    expect(header?.classList.contains(styles.headerAboveBottomSheet)).toBe(
      false,
    );

    // 상세 시트를 full 로 열면 46px 부터 펼쳐지는 목록이 시트(z-index 1000) 뒤로
    // 들어간다. 목록이 열린 동안만 헤더를 시트 위로 올린다.
    fireEvent.click(trigger);
    expect(header?.classList.contains(styles.headerAboveBottomSheet)).toBe(
      true,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(header?.classList.contains(styles.headerAboveBottomSheet)).toBe(
      false,
    );
  });
});
