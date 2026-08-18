import { describe, expect, it, vi } from "vitest";
import {
  recoverInterruptedLocationRequest,
  retryNavigationOriginLocation,
} from "./location-request-recovery";

describe("location request recovery", () => {
  it("중단된 내 위치 요청은 새 추적 대신 새로고침으로 복구한다", () => {
    const reload = vi.fn();

    expect(
      recoverInterruptedLocationRequest({ isInterrupted: true, reload }),
    ).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });

  it("중단된 길찾기 출발지 요청은 새 추적 대신 새로고침으로 복구한다", () => {
    const reload = vi.fn();
    const startTracking = vi.fn();

    retryNavigationOriginLocation({
      isCurrentLocationRequested: true,
      isInterrupted: true,
      reload,
      startTracking,
    });

    expect(reload).toHaveBeenCalledOnce();
    expect(startTracking).not.toHaveBeenCalled();
  });

  it("정상 길찾기 출발지 요청은 위치 추적을 시작한다", () => {
    const reload = vi.fn();
    const startTracking = vi.fn();

    retryNavigationOriginLocation({
      isCurrentLocationRequested: true,
      isInterrupted: false,
      reload,
      startTracking,
    });

    expect(reload).not.toHaveBeenCalled();
    expect(startTracking).toHaveBeenCalledOnce();
  });

  it("현재 위치를 쓰지 않는 길찾기 출발지는 위치 요청을 시작하지 않는다", () => {
    const reload = vi.fn();
    const startTracking = vi.fn();

    retryNavigationOriginLocation({
      isCurrentLocationRequested: false,
      isInterrupted: true,
      reload,
      startTracking,
    });

    expect(reload).not.toHaveBeenCalled();
    expect(startTracking).not.toHaveBeenCalled();
  });
});
