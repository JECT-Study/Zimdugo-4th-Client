// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LockerTimerModal } from "./LockerTimerModal";

describe("LockerTimerModal", () => {
  beforeEach(() => {
    setLanguageTag("ko");
    Element.prototype.scrollTo = vi.fn();
  });

  afterEach(() => cleanup());

  it("00시간 00분이면 타이머 시작 버튼을 비활성화한다", () => {
    render(
      <LockerTimerModal
        isOpen
        mode="setup"
        hours="00"
        minutes="00"
        currentTime={new Date(2026, 7, 29, 15, 31)}
        onOpenChange={() => undefined}
        onDurationChange={() => undefined}
        onStart={() => undefined}
      />,
    );

    const startButton = screen.getByRole("button", { name: "타이머 켜기" });
    expect((startButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("타이머를 설정하세요")).toBeTruthy();
  });

  it("시간이 선택되면 현재 시각에 설정 시간을 더해 종료 시각을 표시한다", () => {
    const handleStart = vi.fn();

    render(
      <LockerTimerModal
        isOpen
        mode="setup"
        hours="00"
        minutes="59"
        currentTime={new Date(2026, 7, 29, 15, 31)}
        onOpenChange={() => undefined}
        onDurationChange={() => undefined}
        onStart={handleStart}
      />,
    );

    expect(screen.getByText("16:30 이용 종료 예정")).toBeTruthy();
    expect(screen.queryByText("타이머를 설정하세요")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "타이머 켜기" }));
    expect(handleStart).toHaveBeenCalledOnce();
  });

  it("실행 중 상태에서 타이머 종료 요청을 전달한다", () => {
    const handleStop = vi.fn();

    render(
      <LockerTimerModal
        isOpen
        mode="running"
        remainingTimeLabel="05 : 30"
        endTimeLabel="16:30"
        remainingTimeInSeconds={19_800}
        configuredTimeInSeconds={28_800}
        onOpenChange={() => undefined}
        onStop={handleStop}
      />,
    );

    expect(
      screen
        .getByRole("progressbar", { name: "보관 타이머" })
        .getAttribute("aria-valuenow"),
    ).toBe("69");
    fireEvent.click(screen.getByRole("button", { name: "타이머 끄기" }));
    expect(handleStop).toHaveBeenCalledOnce();
  });
});
