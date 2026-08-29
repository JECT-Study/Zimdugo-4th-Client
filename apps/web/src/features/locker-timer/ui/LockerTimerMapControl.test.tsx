// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  removeLockerTimer,
  saveLockerTimer,
} from "../model/locker-timer-storage";
import { LockerTimerMapControl } from "./LockerTimerMapControl";

describe("LockerTimerMapControl", () => {
  beforeEach(() => {
    setLanguageTag("ko");
    window.localStorage.clear();
    Element.prototype.scrollTo = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 29, 10, 0));
  });

  afterEach(() => {
    removeLockerTimer(101);
    cleanup();
    vi.useRealTimers();
  });

  it("실행 중인 타이머의 남은 시간을 표시하고 해당 보관함을 고른다", () => {
    saveLockerTimer(101, {
      configuredTimeInSeconds: 5 * 60 * 60 + 30 * 60,
      endAt: Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000,
    });
    const handleSelect = vi.fn();

    render(
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
    render(
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
