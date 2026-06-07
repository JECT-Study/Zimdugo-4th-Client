// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
} from "#/composites/search/search-list-model";
import { SearchListRecent } from "./SearchListRecent";
import { SearchListResult, SearchLockerResult } from "./SearchListResult";

const PLACE: SearchPlaceResultItem = {
  itemType: "PLACE",
  placeId: 1,
  title: "코엑스",
  distanceLabel: "120m",
  address: "서울 강남구 영동대로 513",
  distanceMeters: 120,
  lockers: [
    {
      itemType: "LOCKER",
      lockerId: 101,
      title: "코엑스 메가박스 보관함",
      categoryLabel: "복합문화공간",
      updatedLabel: "10분 전 업데이트",
      distanceLabel: "120m",
      address: "서울 강남구 영동대로 513",
    },
    {
      itemType: "LOCKER",
      lockerId: 102,
      title: "코엑스 동문 보관함",
      categoryLabel: "복합문화공간",
      updatedLabel: "1시간 전 업데이트",
      distanceLabel: "240m",
      address: "서울 강남구 영동대로 513",
    },
  ],
};

const STANDALONE_LOCKER: SearchLockerResultItem = {
  itemType: "LOCKER",
  lockerId: 9001,
  title: "삼성역 독립 보관함",
  categoryLabel: "지하철역",
  updatedLabel: "방금 업데이트",
  distanceLabel: "80m",
  address: "서울 강남구 테헤란로 538",
};

afterEach(cleanup);

describe("search list rows", () => {
  it("최근 검색어 선택과 삭제 동작을 분리한다", () => {
    const handlePress = vi.fn();
    const handleRemove = vi.fn();

    render(
      <SearchListRecent
        dateLabel="06.07"
        onPress={handlePress}
        onRemove={handleRemove}
        removeAriaLabel="최근 검색어 삭제"
      >
        코엑스
      </SearchListRecent>,
    );

    fireEvent.click(screen.getByRole("button", { name: "코엑스" }));
    fireEvent.click(screen.getByRole("button", { name: "최근 검색어 삭제" }));

    expect(handlePress).toHaveBeenCalledOnce();
    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it("장소 행 전체를 토글 버튼으로 제공하고 펼치면 최소 두 보관함을 표시한다", () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <SearchListResult
        item={PLACE}
        isExpanded={false}
        onToggle={handleToggle}
      />,
    );

    const placeButton = screen.getByRole("button", { name: /코엑스.*120m/ });
    expect(placeButton.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(placeButton);
    expect(handleToggle).toHaveBeenCalledOnce();

    rerender(
      <SearchListResult item={PLACE} isExpanded onToggle={handleToggle} />,
    );

    expect(screen.getByText("코엑스 메가박스 보관함")).toBeTruthy();
    expect(screen.getByText("코엑스 동문 보관함")).toBeTruthy();
  });

  it("보관함 상세 이동과 즐겨찾기 동작을 분리한다", () => {
    const handleLockerPress = vi.fn();
    const handleFavoriteChange = vi.fn();

    render(
      <SearchListResult
        item={PLACE}
        isExpanded
        onToggle={() => undefined}
        onLockerPress={handleLockerPress}
        onFavoriteChange={handleFavoriteChange}
        favoriteAddLabel="즐겨찾기 추가"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /코엑스 메가박스 보관함.*120m/,
      }),
    );
    const favoriteButton = screen.getAllByRole("button", {
      name: "즐겨찾기 추가",
    })[0];
    if (!favoriteButton) {
      throw new Error("즐겨찾기 버튼이 렌더링되지 않았습니다.");
    }
    fireEvent.click(favoriteButton);

    expect(handleLockerPress).toHaveBeenCalledWith(PLACE.lockers[0]);
    expect(handleFavoriteChange).toHaveBeenCalledWith(PLACE.lockers[0], true);
  });

  it("독립 보관함은 아코디언 없이 최상위 결과로 렌더링한다", () => {
    render(<SearchLockerResult item={STANDALONE_LOCKER} />);

    expect(
      screen.getByRole("button", { name: /삼성역 독립 보관함.*80m/ }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { expanded: false })).toBeNull();
  });
});
