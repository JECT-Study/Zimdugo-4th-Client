// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ReportListItem } from "./ReportListItem";

afterEach(cleanup);

const REPORT_ITEM_PROPS = {
  titleText: "신촌역 5번 출구 B2 보관함",
  locationLabel: "서울 서대문구 신촌로 83",
  detailText: "무인 보관함",
  updatedLabel: "1시간 전",
};

describe("ReportListItem", () => {
  it("기본 디자인은 주소와 상세 메타 및 chevron을 표시한다", () => {
    const { container } = render(<ReportListItem {...REPORT_ITEM_PROPS} />);

    expect(screen.getByText(REPORT_ITEM_PROPS.titleText)).toBeTruthy();
    expect(screen.getByText(REPORT_ITEM_PROPS.locationLabel)).toBeTruthy();
    expect(screen.getByText(REPORT_ITEM_PROPS.detailText)).toBeTruthy();
    expect(screen.getByText(REPORT_ITEM_PROPS.updatedLabel)).toBeTruthy();
    expect(container.querySelector('[data-slot="chevron"]')).toBeTruthy();
  });

  it("긴 문구는 말줄임 처리하면서 전체 문구를 title 속성으로 보존한다", () => {
    const longTitle = "서울역 공항철도 도심공항터미널 지하 2층 대형 보관함";
    const longAddress =
      "서울특별시 용산구 한강대로 405 서울역 공항철도 도심공항터미널";
    const longDetail = "무인 보관함 · 공항철도 개찰구를 지나 긴 복도 끝";

    render(
      <ReportListItem
        {...REPORT_ITEM_PROPS}
        titleText={longTitle}
        locationLabel={longAddress}
        detailText={longDetail}
      />,
    );

    expect(screen.getByText(longTitle).getAttribute("title")).toBe(longTitle);
    expect(screen.getByText(longAddress).getAttribute("title")).toBe(
      longAddress,
    );
    expect(screen.getByText(longDetail).getAttribute("title")).toBe(longDetail);
  });

  it("상태 배지를 메타 행과 분리한 상단 오른쪽 행에 표시한다", () => {
    const { container } = render(
      <ReportListItem
        {...REPORT_ITEM_PROPS}
        status="approved"
        statusLabel="승인"
      />,
    );

    const statusRow = container.querySelector('[data-slot="status-row"]');
    const metaRow = container.querySelector('[data-slot="meta-row"]');

    expect(statusRow?.textContent).toContain("승인");
    expect(metaRow?.textContent).not.toContain("승인");
  });
});
