import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportPriceSectionView } from "./ReportPriceSection";

describe("ReportPriceSectionView", () => {
  afterEach(cleanup);

  it("모름 옵션을 선택하면 가격 상태를 none으로 변경한다", () => {
    const setPriceType = vi.fn();

    render(
      <ReportPriceSectionView
        priceType="paid"
        setPriceType={setPriceType}
        minPrice=""
        setMinPrice={vi.fn()}
        maxPrice=""
        setMaxPrice={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("모름"));

    expect(setPriceType).toHaveBeenCalledWith("none");
  });
});
