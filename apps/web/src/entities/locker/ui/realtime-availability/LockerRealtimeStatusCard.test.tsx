import { setLanguageTag } from "@repo/i18n";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LockerRealtimeStatusCard } from "./LockerRealtimeStatusCard";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("LockerRealtimeStatusCard", () => {
  beforeEach(() => {
    setLanguageTag("ko");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-14T14:20:00+09:00"));
  });

  it("사이즈별 잔여 수량과 실시간 이용 가능 상태를 표시한다", () => {
    render(
      <LockerRealtimeStatusCard
        availability={{
          isAvailable: true,
          smallAvailableCount: 4,
          mediumAvailableCount: 2,
          largeAvailableCount: 0,
          fetchedAt: "2026-08-14T14:19:47+09:00",
        }}
      />,
    );

    expect(
      screen.getByRole("region", { name: "실시간 이용 가능" }),
    ).toBeTruthy();
    expect(screen.getByText("방금 업데이트")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("마감")).toBeTruthy();
  });

  it("열어 둔 채 시간이 지나면 갱신 라벨이 따라 바뀐다", async () => {
    render(
      <LockerRealtimeStatusCard
        availability={{
          isAvailable: true,
          smallAvailableCount: 4,
          mediumAvailableCount: 2,
          largeAvailableCount: 0,
          fetchedAt: "2026-08-14T14:19:47+09:00",
        }}
      />,
    );

    expect(screen.getByText("방금 업데이트")).toBeTruthy();

    // 다른 상태 변화 없이 시간만 흐른 상황. 가짜 타이머를 진행시키면 시계도 함께 간다.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4 * 60_000);
    });

    // 14:20:00 에서 4분 -> 14:24:00, fetchedAt(14:19:47) 과의 차는 4분 13초.
    expect(screen.queryByText("방금 업데이트")).toBeNull();
    expect(screen.getByText("4분 전 업데이트")).toBeTruthy();
  });
});
