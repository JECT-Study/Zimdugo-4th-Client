import { m } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setTestLanguage } from "#/shared/test/language-runtime";
import { ReportPriceSectionView } from "./ReportPriceSection";

describe("ReportPriceSectionView", () => {
  // 라벨이 paraglide 메시지라 언어를 고정하지 않으면 한국어로 렌더되지 않는다.
  beforeEach(() => {
    setTestLanguage("ko");
  });

  afterEach(cleanup);

  it("가격 미입력 옵션을 선택하면 가격 상태를 none 으로 바꾼다", () => {
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

    // 문구를 하드코딩하면 메시지가 바뀔 때마다 테스트가 깨진다.
    // 실제로 "모름" 이 "입력 안함" 으로 바뀌면서 한동안 실패해 있었다.
    fireEvent.click(screen.getByText(m.report_price_unknown()));

    expect(setPriceType).toHaveBeenCalledWith("none");
  });
});
