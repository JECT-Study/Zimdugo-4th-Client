import { act, cleanup, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import { useLocationTracking } from "./useLocationTracking";

const postLocationDiagnosticMock = vi.hoisted(() => vi.fn());

vi.mock("./location-diagnostics", () => ({
  postLocationDiagnostic: postLocationDiagnosticMock,
}));

describe("useLocationTracking", () => {
  const originalVisibilityStateDescriptor = Object.getOwnPropertyDescriptor(
    document,
    "visibilityState",
  );
  let watchPositionMock: Mock;
  let clearWatchMock: Mock;
  let queryMock: Mock;

  beforeEach(() => {
    postLocationDiagnosticMock.mockClear();
    // Mock navigator.geolocation
    watchPositionMock = vi.fn().mockReturnValue(123);
    clearWatchMock = vi.fn();
    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        watchPosition: watchPositionMock,
        clearWatch: clearWatchMock,
      },
      configurable: true,
      writable: true,
    });

    // Mock navigator.permissions
    queryMock = vi.fn().mockResolvedValue({
      state: "prompt",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(global.navigator, "permissions", {
      value: {
        query: queryMock,
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    if (originalVisibilityStateDescriptor) {
      Object.defineProperty(
        document,
        "visibilityState",
        originalVisibilityStateDescriptor,
      );
    } else {
      Reflect.deleteProperty(document, "visibilityState");
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should treat the Permissions API result as advisory", async () => {
    queryMock.mockResolvedValueOnce({
      state: "granted",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useLocationTracking());

    // 기다려서 useEffect 내부의 query promise가 resolve되도록 함
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.permission).toBe("granted");
    expect(result.current.isTracking).toBe(false);
    expect(watchPositionMock).not.toHaveBeenCalled();
  });

  it("should call onFirstLocation exactly once when the first position callback is fired", async () => {
    const onFirstLocation = vi.fn();
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() =>
      useLocationTracking({ onFirstLocation, onRequestSettled }),
    );

    // 수동으로 추적 시작
    act(() => {
      result.current.startTracking();
    });

    expect(watchPositionMock).toHaveBeenCalled();
    const successCallback = watchPositionMock.mock.calls[0][0];

    // 첫 번째 위치 콜백 시뮬레이션
    act(() => {
      successCallback({
        coords: { latitude: 37.0, longitude: 127.0, heading: 90 },
      });
    });

    expect(onFirstLocation).toHaveBeenCalledTimes(1);
    expect(onFirstLocation).toHaveBeenCalledWith({
      lat: 37.0,
      lng: 127.0,
      heading: 90,
    });
    expect(onRequestSettled).toHaveBeenCalledWith("success");
    expect(result.current.locationRequestStatus).toBe("success");
    expect(result.current.location).toEqual({
      lat: 37.0,
      lng: 127.0,
      heading: 90,
    });

    // 두 번째 위치 콜백 시뮬레이션
    act(() => {
      successCallback({
        coords: { latitude: 37.1, longitude: 127.1, heading: 100 },
      });
    });

    // onFirstLocation은 더 이상 호출되지 않아야 함
    expect(onFirstLocation).toHaveBeenCalledTimes(1);
    expect(result.current.location).toEqual({
      lat: 37.1,
      lng: 127.1,
      heading: 100,
    });
  });

  it("should clear tracking on unmount", async () => {
    const { result, unmount } = renderHook(() => useLocationTracking());

    act(() => {
      result.current.startTracking();
    });

    expect(watchPositionMock).toHaveBeenCalled();

    unmount();

    // id 123으로 clearWatch가 호출되었는지 확인
    expect(clearWatchMock).toHaveBeenCalledWith(123);
  });

  it("should set tracking to false when permission is denied", async () => {
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() =>
      useLocationTracking({ onRequestSettled }),
    );

    // 권한 요청 후 거부 처리 시뮬레이션
    // navigator.geolocation.getCurrentPosition mock이 없으면 테스트가 복잡해지므로
    // 직접 에러 콜백을 트리거
    act(() => {
      result.current.startTracking();
    });

    expect(watchPositionMock).toHaveBeenCalled();
    const errorCallback = watchPositionMock.mock.calls[0][1];

    act(() => {
      errorCallback({ code: 1, message: "User denied Geolocation" });
    });

    expect(result.current.permission).toBe("denied");
    expect(result.current.locationRequestStatus).toBe("permission-denied");
    expect(result.current.isTracking).toBe(false);
    expect(onRequestSettled).toHaveBeenCalledWith("permission-denied");
    expect(onRequestSettled).toHaveBeenCalledOnce();
    expect(
      postLocationDiagnosticMock.mock.calls.map(([event]) => event),
    ).not.toContain("tracking_cancelled");
  });

  it("should expose an unavailable outcome as a terminal request state", () => {
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() =>
      useLocationTracking({ onRequestSettled }),
    );

    act(() => {
      result.current.startTracking();
    });
    const errorCallback = watchPositionMock.mock.calls[0][1];

    act(() => {
      errorCallback({ code: 2, message: "Position unavailable" });
    });

    expect(result.current.locationRequestStatus).toBe("unavailable");
    expect(result.current.isLocating).toBe(false);
    expect(result.current.isTracking).toBe(false);
    expect(onRequestSettled).toHaveBeenCalledWith("unavailable");
  });

  it("should settle as unsupported when geolocation is unavailable", () => {
    const onRequestSettled = vi.fn();
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() =>
      useLocationTracking({ onRequestSettled }),
    );

    act(() => {
      result.current.startTracking();
    });

    expect(result.current.locationRequestStatus).toBe("unsupported");
    expect(result.current.isLocating).toBe(false);
    expect(result.current.isTracking).toBe(false);
    expect(onRequestSettled).toHaveBeenCalledWith("unsupported");
  });

  it("should ignore a permission query result while a location request is active", async () => {
    let resolvePermission: ((status: PermissionStatus) => void) | undefined;
    queryMock.mockReturnValueOnce(
      new Promise<PermissionStatus>((resolve) => {
        resolvePermission = resolve;
      }),
    );
    const { result } = renderHook(() => useLocationTracking());

    act(() => {
      result.current.startTracking();
    });

    await act(async () => {
      resolvePermission?.({
        state: "denied",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as PermissionStatus);
    });

    expect(result.current.permission).toBe("prompt");
    expect(result.current.isTracking).toBe(true);
  });

  it("should allow a manual retry after a permission-denied request error", () => {
    const { result } = renderHook(() => useLocationTracking());

    act(() => {
      result.current.startTracking();
    });
    const firstErrorCallback = watchPositionMock.mock.calls[0][1];
    act(() => {
      firstErrorCallback({ code: 1, message: "User denied Geolocation" });
    });

    act(() => {
      result.current.startTracking();
    });

    expect(result.current.permission).toBe("prompt");
    expect(result.current.isTracking).toBe(true);
    expect(watchPositionMock).toHaveBeenCalledTimes(2);
  });

  it("should not treat a location timeout as a permission denial", () => {
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() =>
      useLocationTracking({ onRequestSettled }),
    );

    act(() => {
      result.current.startTracking();
    });
    const errorCallback = watchPositionMock.mock.calls[0][1];
    act(() => {
      errorCallback({ code: 3, message: "Location request timed out" });
    });

    expect(result.current.permission).toBe("prompt");
    expect(result.current.error?.code).toBe(3);
    expect(result.current.locationRequestStatus).toBe("timeout");
    expect(result.current.isTracking).toBe(false);
    expect(onRequestSettled).toHaveBeenCalledWith("timeout");
    expect(onRequestSettled).toHaveBeenCalledOnce();
    expect(
      postLocationDiagnosticMock.mock.calls.map(([event]) => event),
    ).not.toContain("tracking_cancelled");
  });

  it("should stop locating when the application watchdog expires", () => {
    vi.useFakeTimers();
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() =>
      useLocationTracking({ onRequestSettled }),
    );

    act(() => {
      result.current.startTracking();
    });
    act(() => {
      vi.advanceTimersByTime(12_000);
    });

    expect(result.current.error?.code).toBe(3);
    expect(result.current.locationRequestStatus).toBe("timeout");
    expect(result.current.isLocating).toBe(false);
    expect(result.current.isTracking).toBe(false);
    expect(clearWatchMock).toHaveBeenCalledWith(123);
    expect(onRequestSettled).toHaveBeenCalledWith("timeout");
    expect(onRequestSettled).toHaveBeenCalledOnce();
    expect(
      postLocationDiagnosticMock.mock.calls.map(([event]) => event),
    ).not.toContain("tracking_cancelled");
  });

  it("should cancel the application watchdog after the first position", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useLocationTracking());

    act(() => {
      result.current.startTracking();
    });
    const successCallback = watchPositionMock.mock.calls[0][0];
    act(() => {
      successCallback({
        coords: { latitude: 37.0, longitude: 127.0, heading: null },
      });
      vi.advanceTimersByTime(12_000);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isTracking).toBe(true);
    expect(result.current.isLocating).toBe(false);
  });

  it("should mark a pending request as interrupted while hidden", () => {
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() =>
      useLocationTracking({ onRequestSettled }),
    );

    act(() => {
      result.current.startTracking();
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.isLocating).toBe(false);
    expect(result.current.isTracking).toBe(false);
    expect(clearWatchMock).toHaveBeenCalledWith(123);
    expect(onRequestSettled).toHaveBeenCalledWith("interrupted");
    expect(result.current.locationRequestStatus).toBe("interrupted");

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.isLocating).toBe(false);
    expect(result.current.isTracking).toBe(false);
    expect(result.current.locationRequestStatus).toBe("interrupted");
    expect(watchPositionMock).toHaveBeenCalledTimes(1);
  });

  it("should ignore a late error from a suspended watch", () => {
    watchPositionMock.mockReturnValueOnce(123).mockReturnValueOnce(456);
    const { result } = renderHook(() => useLocationTracking());

    act(() => {
      result.current.startTracking();
    });
    const staleErrorCallback = watchPositionMock.mock.calls[0][1];

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    act(() => {
      result.current.startTracking();
    });

    act(() => {
      staleErrorCallback({ code: 3, message: "Late timeout" });
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isTracking).toBe(true);
    expect(clearWatchMock).not.toHaveBeenCalledWith(456);
  });

  it("should not create watches from repeated visibility changes", () => {
    const { result } = renderHook(() => useLocationTracking());

    act(() => {
      result.current.startTracking();
    });

    for (let attempt = 0; attempt < 4; attempt += 1) {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
      });

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
    }

    expect(watchPositionMock).toHaveBeenCalledTimes(1);
    expect(result.current.locationRequestStatus).toBe("interrupted");
  });
});
