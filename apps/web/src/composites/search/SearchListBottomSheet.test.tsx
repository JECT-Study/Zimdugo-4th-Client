// @vitest-environment jsdom

import { m, setLanguageTag } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const draggableBottomSheetMock = vi.hoisted(() => vi.fn());

vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  DraggableBottomSheet: (props: {
    children: ReactNode;
    dragSensitivity?: number;
    initialSnapPoint?: number;
    maxSnapPoint?: number;
    miniSnapPoint?: number;
    minSnapPoint?: number;
    showHomeIndicator?: boolean;
    snapRequest?: { id: number; snapPoint: number } | null;
    snapPoint?: number;
  }) => {
    draggableBottomSheetMock(props);
    return (
      <div data-testid="mock-draggable-bottom-sheet">{props.children}</div>
    );
  },
  resolveBottomSheetExpandedProgress: ({
    maxSnapPoint,
    minSnapPoint,
    offset,
  }: {
    maxSnapPoint: number;
    minSnapPoint: number;
    offset: number;
  }) => {
    if (maxSnapPoint === minSnapPoint) return 1;

    return Math.min(
      1,
      Math.max(0, (maxSnapPoint - offset) / (maxSnapPoint - minSnapPoint)),
    );
  },
}));

import {
  resolveLegacySearchListSnapPoints,
  resolveSearchListSnapPoints,
  resolveSearchListSnapStage,
  resolveSearchListVisibleHeight,
  SearchListBottomSheet,
} from "./SearchListBottomSheet";

afterEach(cleanup);

describe("SearchListBottomSheet", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 812,
      writable: true,
    });
  });

  afterEach(() => {
    draggableBottomSheetMock.mockClear();
  });

  it("결과가 짧으면 full 이 콘텐츠 높이만큼만 올라온다", () => {
    // 예전에는 결과가 두어 개여도 늘 화면 꼭대기(112)까지 덮었다.
    // 812 - 320 - 아래 여유 32 = 460
    expect(
      resolveSearchListSnapPoints({ windowHeight: 812, fullContentHeight: 320 })
        .minSnapPoint,
    ).toBe(460);
  });

  it("결과가 길면 지금처럼 상한에서 멈춘다", () => {
    expect(
      resolveSearchListSnapPoints({ windowHeight: 812, fullContentHeight: 900 })
        .minSnapPoint,
    ).toBe(112);
  });

  it("아직 못 쟀으면 상한을 준다", () => {
    expect(
      resolveSearchListSnapPoints({ windowHeight: 812 }).minSnapPoint,
    ).toBe(112);
  });

  it("resolves search-list snaps from visible heights", () => {
    expect(resolveSearchListSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 760,
      miniSnapPoint: 633,
      minSnapPoint: 112,
      snapPoint: 471,
    });
  });

  it("caps responsive visible heights on taller screens", () => {
    expect(
      resolveSearchListVisibleHeight({
        maxVisibleHeight: 481,
        ratio: 0.42,
        windowHeight: 812,
      }),
    ).toBe(341);
    expect(
      resolveSearchListVisibleHeight({
        maxVisibleHeight: 481,
        ratio: 0.42,
        windowHeight: 1200,
      }),
    ).toBe(481);
  });

  it("keeps the legacy snap calculation available for rollback", () => {
    expect(resolveLegacySearchListSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 768,
      miniSnapPoint: 549.5,
      minSnapPoint: 0,
      snapPoint: 331,
    });
    expect(
      resolveSearchListSnapPoints({
        behavior: "legacy",
        windowHeight: 812,
      }),
    ).toEqual(resolveLegacySearchListSnapPoints({ windowHeight: 812 }));
  });

  it("마운트 시점에도 단계와 실제 높이를 알린다", () => {
    // DraggableBottomSheet 는 마운트할 때 onSnapChange 를 부르지 않는다. 알림이
    // 없으면 부모는 직전 시트의 높이를 그대로 들고 있어 컨트롤이 엉뚱한 자리에
    // 놓인다. 목록을 full 로 둔 채 상세로 갔다 돌아오는 경로에서 걸린다.
    const handleSnapStageChange = vi.fn();

    render(
      <SearchListBottomSheet
        searchQuery="강남"
        items={[]}
        onSnapStageChange={handleSnapStageChange}
      />,
    );

    // 기본 스냅은 half 다. 812 - 471 = 341.
    expect(handleSnapStageChange).toHaveBeenCalledWith("half", 341);
  });

  it("실제 화면 높이가 들어와도 단계를 잘못 바꾸지 않는다", () => {
    // 첫 렌더의 스냅 지점은 가정 높이(812)로 계산된다. 마운트 뒤 실제 높이가
    // 반영되면 스냅 지점이 전부 바뀌는데, 예전 오프셋을 새 스냅들과 견주면
    // 667px 화면에서 471 이 half 가 아니라 mini 로 읽힌다. 그러면 실제로는
    // 280px 인 시트를 147px 로 알리게 되고 컨트롤이 시트 뒤에 놓인다.
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 667,
    });

    const handleSnapStageChange = vi.fn();

    render(
      <SearchListBottomSheet
        searchQuery="강남"
        items={[]}
        onSnapStageChange={handleSnapStageChange}
      />,
    );

    const stages = handleSnapStageChange.mock.calls.map(([stage]) => stage);

    expect(stages).not.toContain("mini");
    expect(handleSnapStageChange).toHaveBeenLastCalledWith(
      "half",
      expect.any(Number),
    );
  });

  it("passes detail-style snap props to the draggable sheet by default", () => {
    render(<SearchListBottomSheet searchQuery="강남" items={[]} />);

    expect(draggableBottomSheetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dragSensitivity: 1.2,
        initialSnapPoint: 471,
        maxSnapPoint: 760,
        miniSnapPoint: 633,
        minSnapPoint: 112,
        showHomeIndicator: false,
        snapPoint: 471,
      }),
    );
  });

  it("passes legacy snap props only when explicitly requested", () => {
    render(
      <SearchListBottomSheet
        searchQuery="강남"
        items={[]}
        snapBehavior="legacy"
      />,
    );

    expect(draggableBottomSheetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        maxSnapPoint: 768,
        miniSnapPoint: 549.5,
        minSnapPoint: 0,
        snapPoint: 331,
      }),
    );
  });

  it("keeps caller-provided snap bounds", () => {
    expect(
      resolveSearchListSnapPoints({
        windowHeight: 812,
        minSnapPoint: 80,
        snapPoint: 320,
        maxSnapPoint: 700,
      }),
    ).toEqual({
      maxSnapPoint: 700,
      // miniSnapPoint 만 호출자가 주지 않으므로 미니 단계에서 보일 높이로 계산된다.
      // min(242, round(812 * 0.22)) = 179 → 812 - 179 = 633 (min 80 ~ max 700 안)
      miniSnapPoint: 633,
      minSnapPoint: 80,
      snapPoint: 320,
    });
  });

  it("resolves the nearest search-list snap stage", () => {
    expect(
      resolveSearchListSnapStage({
        maxSnapPoint: 760,
        miniSnapPoint: 570,
        minSnapPoint: 112,
        offset: 580,
        snapPoint: 331,
      }),
    ).toBe("mini");
  });

  it("passes stage snap requests as concrete snap points", () => {
    render(
      <SearchListBottomSheet
        searchQuery="媛뺣궓"
        items={[]}
        snapRequest={{ id: 1, stage: "mini" }}
      />,
    );

    expect(draggableBottomSheetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        snapRequest: {
          id: 1,
          snapPoint: 633,
        },
      }),
    );
  });

  it("keeps filter and sort controls visible when active filters return no lockers", () => {
    setLanguageTag("ko");
    const handleResetFilter = vi.fn();

    render(
      <SearchListBottomSheet
        searchQuery="강남"
        items={[]}
        isFilterActive
        onOpenFilter={vi.fn()}
        onResetFilter={handleResetFilter}
      />,
    );

    expect(screen.getByText(m.search_sort_distance())).toBeTruthy();
    expect(screen.getByText(m.search_sort_recent())).toBeTruthy();
    expect(screen.getByText(m.search_sort_price())).toBeTruthy();

    fireEvent.click(screen.getByText(m.search_filter_reset()));

    expect(handleResetFilter).toHaveBeenCalledOnce();
  });
});
