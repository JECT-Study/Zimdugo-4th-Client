import { m } from "@repo/i18n";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LockerRealtimeAvailabilityCard } from "./LockerRealtimeAvailabilityCard";

afterEach(cleanup);

describe("LockerRealtimeAvailabilityCard", () => {
  it("0을 포함한 실시간 잔여 수량과 갱신 시각을 표시한다", () => {
    render(
      <LockerRealtimeAvailabilityCard
        availability={{
          isAvailable: true,
          smallAvailableCount: 12,
          mediumAvailableCount: 2,
          largeAvailableCount: 0,
          fetchedAt: "2026-08-14T14:19:47.013473",
        }}
      />,
    );

    expect(
      screen.getByText(m.locker_detail_realtime_availability()),
    ).toBeTruthy();
    expect(screen.getByText("S 12 · M 2 · L 0")).toBeTruthy();
    expect(screen.getByText("최근 업데이트 2026-08-14 14:19")).toBeTruthy();
  });

  it("매핑 정보가 없으면 모든 사이즈를 대시로 표시한다", () => {
    render(<LockerRealtimeAvailabilityCard availability={null} />);

    expect(screen.getByText("실시간 이용 정보 미제공")).toBeTruthy();
    expect(screen.getByText("S - · M - · L -")).toBeTruthy();
    expect(screen.queryByText(/최근 업데이트/)).toBeNull();
  });

  it("제공처가 이용 불가 상태이면 응답 수량 대신 대시를 표시한다", () => {
    render(
      <LockerRealtimeAvailabilityCard
        availability={{
          isAvailable: false,
          smallAvailableCount: 12,
          mediumAvailableCount: 2,
          largeAvailableCount: 1,
          fetchedAt: "2026-08-14T14:19:47.013473",
        }}
      />,
    );

    expect(screen.getByText("실시간 이용 정보 미제공")).toBeTruthy();
    expect(screen.getByText("S - · M - · L -")).toBeTruthy();
  });
});
