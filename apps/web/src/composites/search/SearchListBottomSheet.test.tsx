// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchListBottomSheet } from "./SearchListBottomSheet";
import type { SearchLockerResultItem } from "./search-list-model";

const LOCKER_ITEM: SearchLockerResultItem = {
  itemType: "LOCKER",
  lockerId: 1,
  title: "Active Filter Locker",
  categoryLabel: "Museum",
  updatedLabel: "Just now",
  distanceLabel: "120m",
  address: "Seoul",
};

const PLACE_LOCKER_ITEMS: SearchLockerResultItem[] = [
  {
    itemType: "LOCKER",
    lockerId: 101,
    title: "Locker One",
    categoryLabel: "Museum",
    updatedLabel: "Just now",
    distanceLabel: "120m",
    address: "Seoul Gangnam",
  },
  {
    itemType: "LOCKER",
    lockerId: 102,
    title: "Locker Two",
    categoryLabel: "Subway",
    updatedLabel: "1 hour ago",
    distanceLabel: "160m",
    address: "Seoul Gangnam",
  },
];

describe("SearchListBottomSheet", () => {
  it("renders the filter trigger as an active control chip when filters are applied", () => {
    render(
      <SearchListBottomSheet
        searchQuery=""
        items={[LOCKER_ITEM]}
        appLanguage="en"
        isFilterActive
        onOpenFilter={() => undefined}
      />,
    );

    expect(
      screen
        .getByRole("button", { name: "Place type" })
        .getAttribute("data-active"),
    ).toBe("true");
  });

  it("renders place-scoped lockers as a flat locker list", () => {
    render(
      <SearchListBottomSheet
        searchQuery="COEX"
        items={PLACE_LOCKER_ITEMS}
        appLanguage="en"
        placeName="COEX"
      />,
    );

    expect(screen.getByText('"COEX"에 위치한 보관함입니다.')).toBeTruthy();
    expect(screen.getByText("Locker One")).toBeTruthy();
    expect(screen.getByText("Locker Two")).toBeTruthy();
  });
});
