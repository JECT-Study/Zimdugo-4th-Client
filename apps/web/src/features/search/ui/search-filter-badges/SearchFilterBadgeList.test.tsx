// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SearchFilterBadge } from "#/features/search/model/search-filter-badges";
import { SearchFilterBadgeList } from "./SearchFilterBadgeList";

const badgeOf = (label: string): SearchFilterBadge => ({
  key: `placeType:${label}`,
  group: "placeType",
  value: label,
  label,
});

const FIVE_BADGES = ["가", "나", "다", "라", "마"].map(badgeOf);

beforeEach(() => {
  setLanguageTag("ko");
});

afterEach(cleanup);

describe("SearchFilterBadgeList", () => {
  it("두 개까지는 모두 보이고 접지 않는다", () => {
    render(
      <SearchFilterBadgeList
        badges={FIVE_BADGES.slice(0, 2)}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "가 필터 해제" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "나 필터 해제" })).toBeTruthy();
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it("세 개부터는 앞의 두 개와 남은 개수만 보인다", () => {
    render(<SearchFilterBadgeList badges={FIVE_BADGES} onRemove={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: /필터 해제$/ })).toHaveLength(
      2,
    );
    expect(
      screen.getByRole("button", { name: "필터 3개 더 보기" }).textContent,
    ).toBe("+3");
    expect(screen.queryByRole("button", { name: "다 필터 해제" })).toBeNull();
  });

  it("남은 개수를 누르면 모든 뱃지를 펼친다", () => {
    render(<SearchFilterBadgeList badges={FIVE_BADGES} onRemove={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "필터 3개 더 보기" }));

    expect(screen.getAllByRole("button", { name: /필터 해제$/ })).toHaveLength(
      5,
    );
    expect(screen.queryByRole("button", { name: /더 보기$/ })).toBeNull();
  });

  it("뱃지를 누르면 그 뱃지를 지우라고 알린다", () => {
    const handleRemove = vi.fn();
    render(
      <SearchFilterBadgeList badges={FIVE_BADGES} onRemove={handleRemove} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "나 필터 해제" }));

    expect(handleRemove).toHaveBeenCalledWith(FIVE_BADGES[1]);
  });

  it("뱃지가 없으면 줄을 그리지 않는다", () => {
    const { container } = render(
      <SearchFilterBadgeList badges={[]} onRemove={vi.fn()} />,
    );

    expect(container.childElementCount).toBe(0);
  });
});
