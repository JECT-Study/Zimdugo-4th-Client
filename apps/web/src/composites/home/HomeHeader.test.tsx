import { m } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeHeader } from "./HomeHeader";
import * as styles from "./HomeHeader.css";

// vitest 에 globals 가 꺼져 있어 RTL 자동 정리가 걸리지 않는다. 직접 정리하지
// 않으면 앞선 테스트의 헤더가 body 에 남아 screen 질의가 중복으로 잡힌다.
afterEach(cleanup);

/**
 * 헤더는 CSS 청크가 붙을 때까지 `requestAnimationFrame` 으로 확인하고, 그동안
 * 스켈레톤을 보여준다. jsdom 에는 vanilla-extract 스타일이 적용되지 않아 이
 * 프로브가 항상 한도(20 프레임)까지 돈 뒤 타임아웃으로 끝난다.
 *
 * 실제 프레임을 기다리면 테스트 하나가 300ms 넘게 걸릴 뿐 아니라, 병렬 부하에서
 * jsdom 의 프레임 간격이 늘어지면 `findBy*` 의 기본 타임아웃(1s)을 넘겨 간헐적으로
 * 실패했다. 프레임을 테스트가 직접 돌려 대기 시간을 없앤다.
 */
let frameCallbacks: FrameRequestCallback[] = [];

beforeEach(() => {
  frameCallbacks = [];
  vi.stubGlobal(
    "requestAnimationFrame",
    (callback: FrameRequestCallback): number => frameCallbacks.push(callback),
  );
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** 스타일 프로브가 끝날 때까지 프레임을 돌린다. */
const flushStyleProbe = () => {
  // 프로브 한도보다 넉넉히 돌리되, 콜백이 스스로를 다시 예약해도 멈추게 한다.
  for (let round = 0; round < 100 && frameCallbacks.length > 0; round += 1) {
    const pending = frameCallbacks;
    frameCallbacks = [];

    act(() => {
      for (const callback of pending) {
        callback(0);
      }
    });
  }
};

const renderHeader = (profileImageUrl = "") => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const onLogoPress = vi.fn();

  return {
    onLogoPress,
    ...render(
      <QueryClientProvider client={queryClient}>
        <HomeHeader
          profileImageUrl={profileImageUrl}
          onProfilePress={vi.fn()}
          onLogoPress={onLogoPress}
        />
      </QueryClientProvider>,
    ),
  };
};

/** 실제 UI 를 보는 단언은 프로브가 끝난 뒤에 해야 한다. */
const renderStyledHeader = (profileImageUrl = "") => {
  const result = renderHeader(profileImageUrl);
  flushStyleProbe();

  return result;
};

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

  it("사진이 없으면 홈 전용 프로필 아이콘을 표시한다", () => {
    renderStyledHeader();

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
    renderStyledHeader(profileImageUrl);

    const profileImage = screen.getByRole("img", {
      name: m.my_profile_image_alt(),
    });

    expect(profileImage.getAttribute("src")).toBe(profileImageUrl);
  });

  it("헤더 아이콘을 인라인 SVG 로 그린다", () => {
    const { container } = renderStyledHeader();

    // new URL(..., import.meta.url) 로 만든 <img> 자산은 서버 번들에서 치환되지
    // 않아 프리렌더된 HTML 에 file:// 경로가 박히고 초기 진입에서 깨진다.
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("언어 목록이 열린 동안에만 헤더를 바텀시트 위로 올린다", () => {
    const { container } = renderStyledHeader();
    const trigger = screen.getByRole("button", { name: m.settings_language() });
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

  it("로고를 누르면 홈으로 돌아가는 핸들러를 부른다", () => {
    // 로고 svg 가 스스로 aria-label 을 갖고 있어, 버튼 이름을 명시하지 않으면
    // "ZimDUGO 텍스트 로고 (소)" 로 잡혀 무슨 일이 일어나는지 읽히지 않는다.
    const { onLogoPress } = renderStyledHeader();
    const logoButton = screen.getByRole("button", {
      name: m.home_logo_aria(),
    });

    fireEvent.click(logoButton);

    expect(onLogoPress).toHaveBeenCalledTimes(1);
  });
});
