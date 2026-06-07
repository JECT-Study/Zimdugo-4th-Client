// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SearchAutocompleteItem,
  type SearchAutocompleteItemData,
} from "./SearchAutocompleteItem";

const PLACE_AUTOCOMPLETE_ITEM: SearchAutocompleteItemData = {
  itemType: "PLACE",
  placeId: 10,
  title: "신촌역 1번 출구",
  address: "서울 서대문구 창천동",
  updatedLabel: "9시간 전 업데이트",
  categoryLabel: "지하철역",
  distanceLabel: "120m",
};

const LOCKER_AUTOCOMPLETE_ITEM: SearchAutocompleteItemData = {
  itemType: "LOCKER",
  lockerId: 11,
  title: "신촌역 5번 출구 B2층 물품보관함",
  address: "서울 서대문구 신촌로 83",
  updatedLabel: "4시간 전 업데이트",
  categoryLabel: "지하철역",
  distanceLabel: "210m",
};

afterEach(cleanup);

describe("SearchAutocompleteItem", () => {
  it("PLACE 자동완성 항목을 행 전체 선택 버튼으로 렌더링한다", () => {
    const handlePress = vi.fn();

    render(
      <SearchAutocompleteItem
        item={PLACE_AUTOCOMPLETE_ITEM}
        onPress={handlePress}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "신촌역 1번 출구 서울 서대문구 창천동 지하철역 120m",
      }),
    );

    expect(screen.getByText("9시간 전 업데이트")).toBeTruthy();
    expect(handlePress).toHaveBeenCalledWith(PLACE_AUTOCOMPLETE_ITEM);
  });

  it("LOCKER 자동완성 항목을 동일한 정보 구조로 렌더링한다", () => {
    render(<SearchAutocompleteItem item={LOCKER_AUTOCOMPLETE_ITEM} />);

    expect(
      screen.getByRole("button", {
        name: "신촌역 5번 출구 B2층 물품보관함 서울 서대문구 신촌로 83 지하철역 210m",
      }),
    ).toBeTruthy();
    expect(screen.getByText("4시간 전 업데이트")).toBeTruthy();
  });
});
