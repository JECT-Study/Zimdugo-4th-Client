// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PushReminder } from "#/shared/api/push";
import { PUSH_REMINDER_QUERY_KEY } from "../model/push-reminder-queries";
import { LockerTimerMapControl } from "./LockerTimerMapControl";

/**
 * 타이머는 서버 상태다. 네트워크를 태우지 않고 캐시에 직접 심어 화면만 본다.
 */
const renderWithReminder = (reminder: PushReminder | null, ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(PUSH_REMINDER_QUERY_KEY, reminder ? [reminder] : []);

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

const buildReminder = (
  overrides: Partial<PushReminder> = {},
): PushReminder => ({
  id: 1,
  lockerId: 101,
  startedAt: new Date(Date.now()).toISOString(),
  endAt: new Date(
    Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000,
  ).toISOString(),
  totalUsageMinutes: 330,
  remainingMinutes: 330,
  remindBeforeMinutes: null,
  ...overrides,
});

describe("LockerTimerMapControl", () => {
  beforeEach(() => {
    setLanguageTag("ko");
    window.localStorage.clear();
    Element.prototype.scrollTo = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 29, 10, 0));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("실행 중인 타이머의 남은 시간을 표시하고 해당 보관함을 고른다", () => {
    const handleSelect = vi.fn();

    renderWithReminder(
      buildReminder(),
      <LockerTimerMapControl
        buttonClassName="map-control"
        onSelect={handleSelect}
      />,
    );

    const timerButton = screen.getByRole("button", {
      name: "보관 타이머 보기, 5시간 30분",
    });
    expect(screen.getByText("5시간 30분")).toBeTruthy();

    fireEvent.click(timerButton);

    expect(handleSelect).toHaveBeenCalledWith(101);
    // 모달은 상세 시트가 연다. 지도 위에서는 띄우지 않는다.
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("실행 중인 타이머가 없으면 버튼을 표시하지 않는다", () => {
    renderWithReminder(
      null,
      <LockerTimerMapControl
        buttonClassName="map-control"
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "보관 타이머 보기" }),
    ).toBeNull();
  });
});
