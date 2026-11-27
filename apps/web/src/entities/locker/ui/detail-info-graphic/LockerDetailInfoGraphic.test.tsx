// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LockerDetailInfo } from "#/entities/locker/lib/parse-locker-detail-info";
import { setTestLanguage } from "#/shared/test/language-runtime";
import { LockerDetailInfoGraphic } from "./LockerDetailInfoGraphic";

const INFO: LockerDetailInfo = {
  location: "표 내는 곳 주변",
  sizes: [
    { size: "SMALL", count: 36, price: 2200 },
    { size: "MEDIUM", count: 8, price: 3300 },
    { size: "LARGE", count: 0, price: 4400 },
  ],
  priceBasis: "평일 기본 4시간 기준",
  unparsedLines: [],
};

const cardOf = (sizeName: string) => {
  const card = screen.getByText(sizeName).closest("li");
  if (!card) throw new Error(`${sizeName} 카드가 없다`);
  return within(card);
};

beforeEach(() => {
  setTestLanguage("ko");
});

afterEach(cleanup);

describe("LockerDetailInfoGraphic", () => {
  it("크기마다 이름·요금·칸 수를 카드로 그리고 아래에 요금 기준을 단다", () => {
    render(<LockerDetailInfoGraphic info={INFO} />);

    // 상세위치는 보관함 이름이 대개 담고 있어 그림에 달지 않는다.
    expect(screen.queryByText("표 내는 곳 주변")).toBeNull();
    expect(screen.getByText("이용 요금: 평일 기본 4시간 기준")).toBeTruthy();
    expect(cardOf("소형").getByText("2,200원")).toBeTruthy();
    expect(cardOf("소형").getByText("36칸")).toBeTruthy();
    expect(cardOf("중형").getByText("3,300원")).toBeTruthy();
  });

  it("0개로 적힌 크기와 목록에 없는 크기는 모두 없음으로 보인다", () => {
    render(
      <LockerDetailInfoGraphic
        info={{
          ...INFO,
          sizes: [
            { size: "SMALL", count: 36, price: 2200 },
            { size: "MEDIUM", count: 0, price: 3300 },
          ],
        }}
      />,
    );

    expect(cardOf("중형").getByText("없음")).toBeTruthy();
    expect(cardOf("대형").getByText("없음")).toBeTruthy();
    expect(screen.getByText("대형").closest("li")?.dataset.state).toBe(
      "absent",
    );
    expect(screen.queryByText("0칸")).toBeNull();
  });

  it("요금만 읽혔으면 빠진 크기를 없음이라 단정하지 않고 비워 둔다", () => {
    render(
      <LockerDetailInfoGraphic
        info={{
          ...INFO,
          sizes: [
            { size: "SMALL", price: 2000 },
            { size: "MEDIUM", price: 3000 },
          ],
        }}
      />,
    );

    expect(screen.queryByText("없음")).toBeNull();
    expect(screen.getByText("대형").closest("li")?.dataset.state).toBe(
      "unknown",
    );
  });

  it("실시간 남은 칸이 있으면 칸 수를 남은 칸 한 줄로 합치고 게이지를 단다", () => {
    render(
      <LockerDetailInfoGraphic
        info={INFO}
        realtimeAvailability={{
          isAvailable: true,
          smallAvailableCount: 12,
          mediumAvailableCount: 2,
          largeAvailableCount: 0,
          fetchedAt: "2026-11-28T10:00:00",
        }}
      />,
    );

    expect(cardOf("소형").getByText("12/36칸 남음")).toBeTruthy();
    expect(cardOf("소형").queryByText("36칸")).toBeNull();
    expect(cardOf("중형").getByText("2/8칸 남음")).toBeTruthy();
    expect(cardOf("대형").getByText("없음")).toBeTruthy();
  });

  it("실시간 정보를 받지 못했으면 게이지 없이 전체 칸 수만 보여 준다", () => {
    render(
      <LockerDetailInfoGraphic
        info={INFO}
        realtimeAvailability={{
          isAvailable: false,
          smallAvailableCount: 0,
          mediumAvailableCount: 0,
          largeAvailableCount: 0,
          fetchedAt: "2026-11-28T10:00:00",
        }}
      />,
    );

    expect(screen.queryByText(/남음/)).toBeNull();
    expect(cardOf("소형").getByText("36칸")).toBeTruthy();
  });

  it("칸이 있는 크기는 실시간 정보가 없어도 초록 그림으로, 실시간으로 마감이면 회색으로 그린다", () => {
    const fillOf = (sizeName: string) =>
      screen
        .getByText(sizeName)
        .closest("li")
        ?.querySelector("svg path")
        ?.getAttribute("fill");
    const { rerender } = render(<LockerDetailInfoGraphic info={INFO} />);
    const green = fillOf("소형");
    expect(fillOf("중형")).toBe(green);

    rerender(
      <LockerDetailInfoGraphic
        info={INFO}
        realtimeAvailability={{
          isAvailable: true,
          smallAvailableCount: 12,
          mediumAvailableCount: 0,
          largeAvailableCount: 0,
          fetchedAt: "2026-11-28T10:00:00",
        }}
      />,
    );
    expect(fillOf("소형")).toBe(green);
    expect(fillOf("중형")).not.toBe(green);
  });

  it("읽지 못한 줄은 원문 그대로 아래에 남긴다", () => {
    render(
      <LockerDetailInfoGraphic
        info={{ ...INFO, unparsedLines: ["비고: 주말엔 조기 마감"] }}
      />,
    );

    expect(screen.getByText("비고: 주말엔 조기 마감")).toBeTruthy();
  });

  it("남은 칸 비율에 따라 게이지를 넉넉함·적음·거의 없음으로 나눈다", () => {
    const { container } = render(
      <LockerDetailInfoGraphic
        info={{
          ...INFO,
          sizes: [
            { size: "SMALL", count: 10, price: 2200 },
            { size: "MEDIUM", count: 10, price: 3300 },
            { size: "LARGE", count: 10, price: 4400 },
          ],
        }}
        realtimeAvailability={{
          isAvailable: true,
          smallAvailableCount: 8,
          mediumAvailableCount: 4,
          largeAvailableCount: 1,
          fetchedAt: "2026-11-28T10:00:00",
        }}
      />,
    );

    const levels = [...container.querySelectorAll("[data-level]")].map((fill) =>
      fill.getAttribute("data-level"),
    );
    expect(levels).toEqual(["ample", "low", "critical"]);
  });
});
