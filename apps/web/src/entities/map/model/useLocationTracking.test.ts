import { act, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import {
  LOCATION_TRACKING_CONSENT_STORAGE_KEY,
  useLocationTracking,
} from "./useLocationTracking";

describe("useLocationTracking", () => {
  let watchPositionMock: Mock;
  let clearWatchMock: Mock;
  let queryMock: Mock;

  beforeEach(() => {
    window.localStorage.clear();

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
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should start tracking automatically if permission is initially granted", async () => {
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
    expect(result.current.isTracking).toBe(true);
    expect(watchPositionMock).toHaveBeenCalled();
    expect(
      window.localStorage.getItem(LOCATION_TRACKING_CONSENT_STORAGE_KEY),
    ).toBe("true");
  });

  it("should resume tracking from stored consent when Permissions API is unavailable", async () => {
    Object.defineProperty(global.navigator, "permissions", {
      value: undefined,
      configurable: true,
      writable: true,
    });
    window.localStorage.setItem(LOCATION_TRACKING_CONSENT_STORAGE_KEY, "true");

    const { result } = renderHook(() => useLocationTracking());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isTracking).toBe(true);
    expect(watchPositionMock).toHaveBeenCalled();
  });

  it("should not request location on mount without stored consent when Permissions API is unavailable", async () => {
    Object.defineProperty(global.navigator, "permissions", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useLocationTracking());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isTracking).toBe(false);
    expect(watchPositionMock).not.toHaveBeenCalled();
  });

  it("should call onFirstLocation exactly once when the first position callback is fired", async () => {
    const onFirstLocation = vi.fn();
    const { result } = renderHook(() =>
      useLocationTracking({ onFirstLocation }),
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
    expect(result.current.location).toEqual({
      lat: 37.0,
      lng: 127.0,
      heading: 90,
    });
    expect(
      window.localStorage.getItem(LOCATION_TRACKING_CONSENT_STORAGE_KEY),
    ).toBe("true");

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
    const { result } = renderHook(() => useLocationTracking());

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
    expect(result.current.isTracking).toBe(false);
    expect(
      window.localStorage.getItem(LOCATION_TRACKING_CONSENT_STORAGE_KEY),
    ).toBeNull();
  });
});
