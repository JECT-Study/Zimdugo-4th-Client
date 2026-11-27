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
  it("크기마다 이름·요금·칸 수를 카드로 그리고 요금 기준을 단다", () => {
    render(<LockerDetailInfoGraphic info={INFO} />);

    // 상세위치는 보관함 이름이 대개 담고 있어 그림에 달지 않는다.
    expect(screen.queryByText("표 내는 곳 주변")).toBeNull();
    expect(screen.getByText("평일 기본 4시간 기준")).toBeTruthy();
    expect(cardOf("소형").getByText("2,200원")).toBeTruthy();
    expect(cardOf("소형").getByText("36칸")).toBeTruthy();
    expect(cardOf("중형").getByText("3,300원")).toBeTruthy();
    expect(screen.getByText("대형").closest("li")?.dataset.empty).toBe("true");
  });

  it("실시간 남은 칸이 있으면 카드마다 남은 칸과 전체 칸을 함께 보여 준다", () => {
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

    expect(cardOf("소형").getByText("남은 칸 12 / 전체 36")).toBeTruthy();
    expect(cardOf("중형").getByText("남은 칸 2 / 전체 8")).toBeTruthy();
    // 전체가 0 칸인 크기는 채울 게이지가 없다.
    expect(cardOf("대형").queryByText(/남은 칸/)).toBeNull();
  });

  it("실시간 정보를 받지 못했으면 게이지를 그리지 않는다", () => {
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

    expect(screen.queryByText(/남은 칸/)).toBeNull();
  });

  it("읽지 못한 줄은 원문 그대로 아래에 남긴다", () => {
    render(
      <LockerDetailInfoGraphic
        info={{ ...INFO, unparsedLines: ["비고: 주말엔 조기 마감"] }}
      />,
    );

    expect(screen.getByText("비고: 주말엔 조기 마감")).toBeTruthy();
  });

  it("칸이 있는 크기는 실시간 정보가 없어도 초록 그림으로, 실시간으로 마감이면 회색으로 그린다", () => {
    const stateOf = (sizeName: string) =>
      screen
        .getByText(sizeName)
        .closest("li")
        ?.querySelector("svg path")
        ?.getAttribute("fill");
    const { rerender } = render(<LockerDetailInfoGraphic info={INFO} />);
    const green = stateOf("소형");
    expect(stateOf("중형")).toBe(green);

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
    expect(stateOf("소형")).toBe(green);
    expect(stateOf("중형")).not.toBe(green);
  });
});
