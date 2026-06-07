// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchFilterBottomSheet } from "./SearchFilterBottomSheet";

afterEach(cleanup);

describe("SearchFilterBottomSheet", () => {
  it("applies selected size, price, and place filters", () => {
    setLanguageTag("ko");
    const handleApply = vi.fn();

    render(<SearchFilterBottomSheet onApply={handleApply} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "무료" }));
    fireEvent.click(screen.getByRole("button", { name: "실내" }));
    fireEvent.click(screen.getByRole("button", { name: "박물관" }));
    fireEvent.click(screen.getByRole("button", { name: "지하철역" }));
    fireEvent.click(screen.getByRole("button", { name: "보관함 보기" }));

    expect(handleApply).toHaveBeenCalledWith({
      regionActive: false,
      sizePriceActive: true,
      placeTypeActive: true,
      priceType: "free",
      minPrice: "",
      maxPrice: "",
      indoorOutdoorState: ["indoor"],
      placeTypeState: ["museum", "subway"],
      selectedSizes: [],
    });
  });

  it("restores previously applied filter values when reopened", () => {
    setLanguageTag("ko");

    render(
      <SearchFilterBottomSheet
        initialFilters={{
          regionActive: false,
          sizePriceActive: true,
          placeTypeActive: true,
          priceType: "free",
          minPrice: "",
          maxPrice: "",
          indoorOutdoorState: ["indoor"],
          placeTypeState: ["museum"],
          selectedSizes: [],
        }}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "무료" })).toHaveProperty(
      "checked",
      true,
    );
    expect(
      screen.getByRole("button", { name: "실내" }).getAttribute("data-active"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "박물관" })
        .getAttribute("data-active"),
    ).toBe("true");
  });
});
