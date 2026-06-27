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

  it("resolves search-list snaps from visible heights", () => {
    expect(resolveSearchListSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 760,
      miniSnapPoint: 585,
      minSnapPoint: 112,
      snapPoint: 422,
    });
  });

  it("caps responsive visible heights on taller screens", () => {
    expect(
      resolveSearchListVisibleHeight({
        maxVisibleHeight: 481,
        ratio: 0.48,
        windowHeight: 812,
      }),
    ).toBe(390);
    expect(
      resolveSearchListVisibleHeight({
        maxVisibleHeight: 481,
        ratio: 0.48,
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

  it("passes detail-style snap props to the draggable sheet by default", () => {
    render(<SearchListBottomSheet searchQuery="강남" items={[]} />);

    expect(draggableBottomSheetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dragSensitivity: 1.2,
        initialSnapPoint: 422,
        maxSnapPoint: 760,
        miniSnapPoint: 585,
        minSnapPoint: 112,
        showHomeIndicator: false,
        snapPoint: 422,
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
      miniSnapPoint: 585,
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
          snapPoint: 585,
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
