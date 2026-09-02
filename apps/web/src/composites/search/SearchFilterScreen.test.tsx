// @vitest-environment jsdom

import { m, setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * 화면이 표면을 직접 렌더하면 이 가짜가 던진다.
 *
 * 그냥 렌더해 보는 것만으로는 부족하다. 화면이 시트를 다시 품어도 시트가 자식을
 * 그려 주므로 통과한다. 표면을 쓰는 순간 실패하도록 두어야 분리가 지켜진다.
 */
vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  DraggableBottomSheet: () => {
    throw new Error("화면이 표면(DraggableBottomSheet)을 직접 렌더하고 있다");
  },
  resolveBottomSheetExpandedProgress: () => 1,
}));

import { SearchFilterScreen } from "./SearchFilterScreen";

afterEach(cleanup);

/** SizeCard 가 보관함 설정을 쿼리로 읽는다. 화면과는 무관한 배선이다. */
const renderScreen = (element: ReactElement) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {element}
    </QueryClientProvider>,
  );

const getActionBar = () =>
  screen.getByText(m.search_filter_reset()).closest("div");

describe("SearchFilterScreen", () => {
  it("표면 없이 혼자 선다", () => {
    setLanguageTag("ko");

    renderScreen(<SearchFilterScreen />);

    expect(screen.getByText(m.search_filter_section_size())).toBeTruthy();
    expect(screen.getByText(m.search_filter_reset())).toBeTruthy();
    expect(screen.getByText(m.search_filter_view_lockers())).toBeTruthy();
  });

  it("고른 값을 그대로 올려보낸다", () => {
    setLanguageTag("ko");
    const handleApply = vi.fn();

    renderScreen(
      <SearchFilterScreen
        initialFilters={{
          regionActive: false,
          sizeActive: false,
          placeTypeActive: false,
          indoorOutdoorState: ["indoor"],
          placeTypeState: [],
          selectedSizes: [],
        }}
        onApply={handleApply}
      />,
    );

    fireEvent.click(screen.getByText(m.search_filter_view_lockers()));

    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        indoorOutdoorState: ["indoor"],
        regionActive: true,
      }),
    );
  });

  /**
   * 펼침이라는 개념이 없는 표면도 있다. 값을 주지 않으면 다 펼친 것으로 본다.
   */
  it("펼침 정도를 주지 않으면 액션 바를 그대로 보인다", () => {
    setLanguageTag("ko");

    renderScreen(<SearchFilterScreen />);
    const actionBar = getActionBar();

    expect(actionBar?.style.opacity).toBe("1");
    expect(actionBar?.style.transform).toBe("translateY(0px)");
  });

  it("접힌 표면이 준 값만큼 액션 바를 내린다", () => {
    setLanguageTag("ko");

    renderScreen(<SearchFilterScreen expandedProgress={0} />);
    const actionBar = getActionBar();

    expect(actionBar?.style.transform).toBe("translateY(8px)");
  });
});
