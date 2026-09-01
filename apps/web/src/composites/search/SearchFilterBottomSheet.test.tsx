// @vitest-environment jsdom

import { m, setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  DraggableBottomSheet: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-draggable-bottom-sheet">{children}</div>
  ),
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
  resolveLegacySearchFilterSnapPoints,
  resolveSearchFilterSnapPoints,
  SearchFilterBottomSheet,
} from "./SearchFilterBottomSheet";

afterEach(cleanup);

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const getButtonByText = (name: string) => {
  const element = screen.getByText(name).closest("button");
  if (!element) {
    throw new Error(`${name} button not found`);
  }

  return element;
};

describe("SearchFilterBottomSheet", () => {
  it("필터 시트는 기본으로 하프 없이 스냅을 정한다", () => {
    expect(resolveSearchFilterSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 788,
      miniSnapPoint: undefined,
      minSnapPoint: 112,
      snapPoint: 112,
    });
  });

  it("full 높이를 콘텐츠에 맞추되 이전 높이를 상한으로 둔다", () => {
    // 812 - 560 - 손잡이 24 - 아래 여유 32 = 196
    expect(
      resolveSearchFilterSnapPoints({
        windowHeight: 812,
        contentHeight: 560,
      }),
    ).toEqual({
      maxSnapPoint: 788,
      miniSnapPoint: undefined,
      minSnapPoint: 196,
      snapPoint: 196,
    });
  });

  it("되돌릴 수 있도록 예전 필터 스냅 계산을 남겨 둔다", () => {
    expect(resolveLegacySearchFilterSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 788,
      miniSnapPoint: 420,
      minSnapPoint: 52,
      snapPoint: 52,
    });
    expect(
      resolveSearchFilterSnapPoints({
        behavior: "legacy",
        windowHeight: 812,
      }),
    ).toEqual(resolveLegacySearchFilterSnapPoints({ windowHeight: 812 }));
  });

  it("고른 실내·실외와 장소 필터를 적용한다", () => {
    setLanguageTag("ko");
    const handleApply = vi.fn();

    render(
      <QueryClientProvider client={createQueryClient()}>
        <SearchFilterBottomSheet onApply={handleApply} />
      </QueryClientProvider>,
    );

    fireEvent.click(getButtonByText(m.search_filter_indoor_short()));
    fireEvent.click(getButtonByText(m.search_filter_outdoor_short()));
    fireEvent.click(getButtonByText(m.search_filter_place_museum_short()));
    fireEvent.click(getButtonByText(m.search_filter_place_subway_short()));
    fireEvent.click(getButtonByText(m.search_filter_view_lockers()));

    expect(handleApply).toHaveBeenCalledWith({
      regionActive: true,
      sizeActive: false,
      placeTypeActive: true,
      indoorOutdoorState: ["indoor", "outdoor"],
      placeTypeState: ["museum", "subway"],
      selectedSizes: [],
    });
  });

  it("다시 열면 먼저 적용한 필터 값을 되살린다", () => {
    setLanguageTag("ko");

    render(
      <QueryClientProvider client={createQueryClient()}>
        <SearchFilterBottomSheet
          initialFilters={{
            regionActive: false,
            sizeActive: false,
            placeTypeActive: true,
            indoorOutdoorState: ["indoor"],
            placeTypeState: ["museum"],
            selectedSizes: [],
          }}
        />
      </QueryClientProvider>,
    );

    expect(
      getButtonByText(m.search_filter_indoor_short()).getAttribute(
        "data-active",
      ),
    ).toBe("true");
    expect(
      getButtonByText(m.search_filter_place_museum_short()).getAttribute(
        "data-active",
      ),
    ).toBe("true");
  });
});
