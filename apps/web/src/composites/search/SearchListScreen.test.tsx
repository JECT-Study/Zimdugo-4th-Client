// @vitest-environment jsdom

import { m, setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
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

import { SearchListScreen } from "./SearchListScreen";

afterEach(cleanup);

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

/** 결과 헤더는 펼침 정도에 따라 transform 을 받는 유일한 요소다. */
const getResultHeader = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[style*="translateY"]');

describe("SearchListScreen", () => {
  it("표면 없이 혼자 선다", () => {
    setLanguageTag("ko");

    const { container } = renderScreen(
      <SearchListScreen searchQuery="강남" isFilterActive />,
    );

    expect(getResultHeader(container)).toBeTruthy();
  });

  it("정렬 칩 없이 필터 칩만 그린다", () => {
    setLanguageTag("ko");

    renderScreen(
      <SearchListScreen
        searchQuery="강남"
        isFilterActive
        onOpenFilter={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(
      screen.getByRole("button", {
        name: m.search_filter_dropdown_place_type(),
      }),
    ).toBeTruthy();
  });

  /**
   * 결과가 없는 화면은 잴 콘텐츠 길이가 없다. 0 을 올려보내면 표면이 "높이가 0 인
   * 콘텐츠" 로 알아듣고 시트를 바닥까지 내린다. 없다는 뜻은 null 이어야 한다.
   */
  it("잴 것이 없으면 높이 대신 null 을 올려보낸다", () => {
    setLanguageTag("ko");
    const handleContentHeightChange = vi.fn();

    renderScreen(
      <SearchListScreen
        searchQuery="강남"
        isLoading
        onContentHeightChange={handleContentHeightChange}
      />,
    );

    expect(handleContentHeightChange).toHaveBeenCalledWith(null);
  });

  it("펼침 정도를 주지 않으면 결과 헤더를 그대로 보인다", () => {
    setLanguageTag("ko");

    const { container } = renderScreen(
      <SearchListScreen searchQuery="강남" isFilterActive />,
    );

    expect(getResultHeader(container)?.style.opacity).toBe("1");
    expect(getResultHeader(container)?.style.transform).toBe("translateY(0px)");
  });

  it("접힌 표면이 준 값만큼 결과 헤더를 내린다", () => {
    setLanguageTag("ko");

    const { container } = renderScreen(
      <SearchListScreen
        searchQuery="강남"
        isFilterActive
        expandedProgress={0}
      />,
    );

    expect(getResultHeader(container)?.style.transform).toBe("translateY(6px)");
  });
});
