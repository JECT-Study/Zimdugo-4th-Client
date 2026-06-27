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
  it("resolves filter sheet snaps without changing its expanded default", () => {
    expect(resolveSearchFilterSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 788,
      miniSnapPoint: 420,
      minSnapPoint: 52,
      snapPoint: 52,
    });
  });

  it("keeps the legacy filter snap calculation available for rollback", () => {
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

  it("applies selected indoor/outdoor and place filters", () => {
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

  it("restores previously applied filter values when reopened", () => {
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
