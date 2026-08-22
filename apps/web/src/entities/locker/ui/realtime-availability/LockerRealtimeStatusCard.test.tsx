import { setLanguageTag } from "@repo/i18n";
import { cleanup, render, screen } from "@testing-library/react";
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

  it("사이즈별 잔여 수량과 마감 상태를 표시한다", () => {
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

    expect(screen.getByRole("region", { name: "실시간" })).toBeTruthy();
    expect(screen.getByText("방금 업데이트")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("마감")).toBeTruthy();
  });
});
