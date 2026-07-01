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
  title: "COEX",
  distanceLabel: "120m",
  address: "513 Yeongdong-daero, Gangnam-gu, Seoul",
  distanceMeters: 120,
  lockers: [
    {
      itemType: "LOCKER",
      lockerId: 101,
      title: "COEX Mall Mega Box locker",
      categoryLabel: "Culture space",
      updatedLabel: "Updated 10 min ago",
      distanceLabel: "120m",
      address: "513 Yeongdong-daero, Gangnam-gu, Seoul",
    },
    {
      itemType: "LOCKER",
      lockerId: 102,
      title: "COEX East Gate locker",
      categoryLabel: "Station",
      updatedLabel: "Updated 1 hour ago",
      distanceLabel: "240m",
      address: "513 Yeongdong-daero, Gangnam-gu, Seoul",
    },
  ],
};

const STANDALONE_LOCKER: SearchLockerResultItem = {
  itemType: "LOCKER",
  lockerId: 9001,
  title: "Samsung Station locker",
  categoryLabel: "Subway station",
  updatedLabel: "Updated just now",
  distanceLabel: "80m",
  address: "538 Teheran-ro, Gangnam-gu, Seoul",
};

afterEach(cleanup);

describe("search list rows", () => {
  it("separates recent keyword select and remove actions", () => {
    const handlePress = vi.fn();
    const handleRemove = vi.fn();

    render(
      <SearchListRecent
        dateLabel="06.07"
        onPress={handlePress}
        onRemove={handleRemove}
        removeAriaLabel="Remove recent keyword"
      >
        COEX
      </SearchListRecent>,
    );

    fireEvent.click(screen.getByRole("button", { name: "COEX" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove recent keyword" }),
    );

    expect(handlePress).toHaveBeenCalledOnce();
    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it("renders place lockers as nested locker rows without accordion controls", () => {
    const handleToggle = vi.fn();
    const handlePlacePress = vi.fn();

    render(
      <SearchListResult
        item={PLACE}
        isExpanded={false}
        onToggle={handleToggle}
        onPlacePress={handlePlacePress}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "COEX" }));

    expect(screen.getByText("COEX Mall Mega Box locker")).toBeTruthy();
    expect(screen.getByText("COEX East Gate locker")).toBeTruthy();
    expect(
      screen.getAllByText("513 Yeongdong-daero, Gangnam-gu, Seoul").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { expanded: false })).toBeNull();
    expect(handleToggle).not.toHaveBeenCalled();
    expect(handlePlacePress).toHaveBeenCalledWith(PLACE);
  });

  it("opens locker detail and favorite action from a nested locker row", () => {
    const handleLockerPress = vi.fn();
    const handleFavoriteChange = vi.fn();

    render(
      <SearchListResult
        item={PLACE}
        isExpanded
        onToggle={() => undefined}
        onLockerPress={handleLockerPress}
        onFavoriteChange={handleFavoriteChange}
        favoriteAddLabel="Add favorite"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /COEX Mall Mega Box locker.*120m/,
      }),
    );

    expect(handleLockerPress).toHaveBeenCalledWith(PLACE.lockers[0]);

    fireEvent.click(screen.getAllByRole("button", { name: "Add favorite" })[0]);

    expect(handleFavoriteChange).toHaveBeenCalledWith(PLACE.lockers[0], true);
  });

  it("renders standalone lockers as top-level results without accordion", () => {
    render(<SearchLockerResult item={STANDALONE_LOCKER} />);

    expect(
      screen.getByRole("button", { name: /Samsung Station locker.*80m/ }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { expanded: false })).toBeNull();
  });
});
