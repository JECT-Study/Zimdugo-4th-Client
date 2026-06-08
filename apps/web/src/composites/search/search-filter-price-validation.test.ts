import { describe, expect, it } from "vitest";
import {
  normalizeSearchFilterPriceRange,
  validateSearchFilterPrice,
} from "./search-filter-price-validation";

const messages = {
  invalidRange: () => "invalidRange",
};

describe("validateSearchFilterPrice", () => {
  it("requires both prices when paid filter is selected", () => {
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "",
        maxPrice: "",
        messages,
      }),
    ).toBe("invalidRange");
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "1000",
        maxPrice: "",
        messages,
      }),
    ).toBe("invalidRange");
  });

  it("rejects invalid min and max prices", () => {
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "abc",
        maxPrice: "",
        messages,
      }),
    ).toBe("invalidRange");
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "",
        maxPrice: "abc",
        messages,
      }),
    ).toBe("invalidRange");
  });

  it("uses the same price bounds as report", () => {
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "0",
        maxPrice: "1000",
        messages,
      }),
    ).toBe("invalidRange");
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "1000",
        maxPrice: "100001",
        messages,
      }),
    ).toBe("invalidRange");
  });

  it("rejects a min price greater than the max price", () => {
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "2000",
        maxPrice: "1000",
        messages,
      }),
    ).toBe("invalidRange");
  });

  it("allows valid paid and non-paid filters", () => {
    expect(
      validateSearchFilterPrice({
        priceType: "paid",
        minPrice: "1,000",
        maxPrice: "2,000",
        messages,
      }),
    ).toBeUndefined();
    expect(
      validateSearchFilterPrice({
        priceType: "free",
        minPrice: "",
        maxPrice: "",
        messages,
      }),
    ).toBeUndefined();
  });
});

describe("normalizeSearchFilterPriceRange", () => {
  it("normalizes empty, lower-bound, and upper-bound prices", () => {
    expect(
      normalizeSearchFilterPriceRange({
        minPrice: "0",
        maxPrice: "999999",
        changedField: "min",
      }),
    ).toEqual({ minPrice: "", maxPrice: "100,000" });
    expect(
      normalizeSearchFilterPriceRange({
        minPrice: "500",
        maxPrice: "",
        changedField: "min",
      }),
    ).toEqual({ minPrice: "1,000", maxPrice: "" });
  });

  it("keeps min and max in a valid order based on the changed field", () => {
    expect(
      normalizeSearchFilterPriceRange({
        minPrice: "5,000",
        maxPrice: "3,000",
        changedField: "min",
      }),
    ).toEqual({ minPrice: "5,000", maxPrice: "5,000" });
    expect(
      normalizeSearchFilterPriceRange({
        minPrice: "5,000",
        maxPrice: "3,000",
        changedField: "max",
      }),
    ).toEqual({ minPrice: "3,000", maxPrice: "3,000" });
  });
});
