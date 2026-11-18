// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { setTestLanguage } from "#/shared/test/language-runtime";
import { LockerDetailPreviewCard } from "./LockerDetailPreviewCard";

const locker: LockerDetailItem = {
  itemType: "LOCKER",
  lockerId: 1326,
  title: "9호선 중앙보훈병원",
  address: "서울특별시 강동구 동남로 지하625",
  distanceLabel: "13.5km",
  categoryLabel: "기타",
  updatedLabel: "",
  floorLabel: "지하 1층",
  operatingHoursLabel: "05:30 ~ 24:00",
  priceLabel: "2,000원 ~ 4,000원",
  sizeLabel: "",
  lastUpdatedLabel: "최근 업데이트 2026.11.18 12:00",
};

describe("LockerDetailPreviewCard", () => {
  beforeEach(() => {
    setTestLanguage("ko");
  });

  afterEach(() => {
    cleanup();
  });

  it("보관함 이름을 페이지의 h1 로 낸다", () => {
    render(<LockerDetailPreviewCard locker={locker} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "9호선 중앙보훈병원" }),
    ).toBeTruthy();
  });

  it("주소·위치·운영시간·가격·기준일을 함께 보여 준다", () => {
    render(<LockerDetailPreviewCard locker={locker} />);

    expect(screen.getByText("서울특별시 강동구 동남로 지하625")).toBeTruthy();
    expect(screen.getByText("지하 1층")).toBeTruthy();
    expect(screen.getByText("05:30 ~ 24:00")).toBeTruthy();
    expect(screen.getByText("2,000원 ~ 4,000원")).toBeTruthy();
    expect(screen.getByText("최근 업데이트 2026.11.18 12:00")).toBeTruthy();
  });

  it("값이 비어 있는 항목은 이름표도 내지 않는다", () => {
    render(<LockerDetailPreviewCard locker={locker} />);

    expect(screen.queryByText("사이즈")).toBeNull();
  });

  it("운영시간을 모르면 이름표를 되풀이하는 줄을 내지 않는다", () => {
    render(
      <LockerDetailPreviewCard
        locker={{ ...locker, operatingHoursLabel: "운영시간 미제공" }}
      />,
    );

    expect(screen.queryByText("운영시간")).toBeNull();
    expect(screen.queryByText("운영시간 미제공")).toBeNull();
  });

  it("실시간 잔여 칸과 거리는 싣지 않는다", () => {
    render(<LockerDetailPreviewCard locker={locker} />);

    expect(screen.queryByText("13.5km")).toBeNull();
  });
});
