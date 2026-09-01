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

  it("full 이 없으면 그 자리를 half 로 읽어 접는 길을 남긴다", () => {
    // full 로 읽히면 지도를 눌러도 mini 로 내려가지 않는다. 그 동작은 half 일 때만
    // 접기 때문이다.
    const snaps = resolveSearchListSnapPoints({
      windowHeight: 812,
      fullContentHeight: 120,
    });

    expect(snaps.minSnapPoint).toBe(snaps.snapPoint);
    expect(
      resolveSearchListSnapStage({
        maxSnapPoint: snaps.maxSnapPoint,
        miniSnapPoint: snaps.miniSnapPoint ?? 0,
        minSnapPoint: snaps.minSnapPoint,
        offset: snaps.snapPoint,
        snapPoint: snaps.snapPoint,
      }),
    ).toBe("half");
  });

  it("full 이 뚜렷하면 그 자리는 full 로 읽는다", () => {
    const snaps = resolveSearchListSnapPoints({
      windowHeight: 812,
      fullContentHeight: 320,
    });

    expect(
      resolveSearchListSnapStage({
        maxSnapPoint: snaps.maxSnapPoint,
        miniSnapPoint: snaps.miniSnapPoint ?? 0,
        minSnapPoint: snaps.minSnapPoint,
        offset: snaps.minSnapPoint,
        snapPoint: snaps.snapPoint,
      }),
    ).toBe("full");
  });

  it("호출자가 준 경계 안으로 half·mini 도 들어온다", () => {
    // 화면 기준으로만 재면 자연 half(471) 가 경계(600) 위로 올라가 순서가 뒤집힌다.
    const snaps = resolveSearchListSnapPoints({
      windowHeight: 812,
      minSnapPoint: 600,
    });

    expect(snaps.minSnapPoint).toBe(600);
    expect(snaps.snapPoint).toBeGreaterThanOrEqual(600);
    expect(snaps.snapPoint).toBeLessThanOrEqual(snaps.miniSnapPoint ?? 0);
  });

  it("호출자가 준 half 를 기준으로 full 이 설 자리를 판정한다", () => {
    // 화면 기준 half(471) 로 판정하면 콘텐츠 full(436) 이 살아남아, 지정한 half(120)
    // 보다 아래에 놓인다. 시트는 요청받은 120 을 436 으로 잘라 full 로 열린다.
    const snaps = resolveSearchListSnapPoints({
      windowHeight: 812,
      snapPoint: 120,
      fullContentHeight: 320,
    });

    expect(snaps.snapPoint).toBe(120);
    expect(snaps.minSnapPoint).toBeLessThanOrEqual(120);
  });

  it("결과가 길면 full 이 콘텐츠 높이만큼만 올라온다", () => {
    expect(
      resolveSearchListSnapPoints({ windowHeight: 812, fullContentHeight: 320 })
        .minSnapPoint,
    ).toBe(436);
  });

  it("결과가 짧으면 half 가 시트의 끝이다", () => {
    // full 을 억지로 두면 half 와 겹쳐, 지도를 눌러 접는 동작이 막힌다.
    const snaps = resolveSearchListSnapPoints({
      windowHeight: 812,
      fullContentHeight: 120,
    });

    expect(snaps.minSnapPoint).toBe(snaps.snapPoint);
  });

  it("콘텐츠가 바뀌어도 half·mini 는 그대로 둔다", () => {
    // 이 둘이 따라 움직이면 시트가 초기 위치를 새로 요청받은 것으로 보고, 사용자가
    // 옮겨 둔 단계를 무시한 채 그 자리로 뛴다.
    const 측정전 = resolveSearchListSnapPoints({ windowHeight: 812 });
    const 측정후 = resolveSearchListSnapPoints({
      windowHeight: 812,
      fullContentHeight: 320,
    });

    expect(측정후.snapPoint).toBe(측정전.snapPoint);
    expect(측정후.miniSnapPoint).toBe(측정전.miniSnapPoint);
  });

  it("스냅 순서가 뒤집히지 않는다", () => {
    for (const fullContentHeight of [80, 120, 285, 320, 900]) {
      const snaps = resolveSearchListSnapPoints({
        windowHeight: 812,
        fullContentHeight,
      });

      expect(snaps.minSnapPoint).toBeLessThanOrEqual(snaps.snapPoint);
      expect(snaps.snapPoint).toBeLessThanOrEqual(snaps.miniSnapPoint ?? 0);
      expect(snaps.miniSnapPoint ?? 0).toBeLessThanOrEqual(snaps.maxSnapPoint);
    }
  });

  it("보이는 높이에서 목록 시트의 스냅을 정한다", () => {
    expect(resolveSearchListSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 760,
      miniSnapPoint: 633,
      minSnapPoint: 112,
      snapPoint: 471,
    });
  });

  it("화면이 높아도 보이는 높이에 상한을 둔다", () => {
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

  it("되돌릴 수 있도록 예전 스냅 계산을 남겨 둔다", () => {
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

  it("기본으로 상세와 같은 방식의 스냅 값을 시트에 넘긴다", () => {
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

  it("예전 스냅 값은 명시적으로 요청할 때만 넘긴다", () => {
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

  it("부르는 쪽이 준 스냅 경계를 지킨다", () => {
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

  it("목록 시트에서 가장 가까운 단계를 찾는다", () => {
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

  it("단계 요청을 실제 스냅 지점으로 바꿔 넘긴다", () => {
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

  it("적용한 필터의 결과가 비어도 필터·정렬 컨트롤은 남긴다", () => {
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
