import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocationDiagnosticsPanel } from "./LocationDiagnosticsPanel";

describe("LocationDiagnosticsPanel", () => {
  const getCurrentPosition = vi.fn();
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));

  beforeEach(() => {
    getCurrentPosition.mockReset();
    fetchMock.mockClear();
    window.history.replaceState({}, "", "/location-diagnostics");
    window.sessionStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      value: {
        query: vi.fn().mockResolvedValue({
          state: "prompt",
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      },
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        clearWatch: vi.fn(),
        getCurrentPosition,
        watchPosition: vi.fn().mockReturnValue(1),
      },
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does not render when diagnostics are disabled", () => {
    render(<LocationDiagnosticsPanel isEnabled={false} />);

    expect(screen.queryByRole("region")).toBeNull();
  });

  it("requests location from a user action without recording coordinates", async () => {
    getCurrentPosition.mockImplementation((onSuccess: PositionCallback) => {
      onSuccess({
        coords: {
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 37.5,
          longitude: 127,
          speed: null,
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      });
    });
    render(<LocationDiagnosticsPanel isEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "기본 1회 요청" }));

    await waitFor(() => {
      expect(screen.getByText(/request-success/)).toBeDefined();
    });
    const log = screen.getByText(/request-success/).textContent ?? "";
    expect(log).not.toMatch(/latitude|longitude|coords/);
    expect(log).not.toContain("37.5");
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
    );

    const sentPayloads = fetchMock.mock.calls.map(([, options]) =>
      JSON.parse(String(options.body)),
    );
    expect(sentPayloads).toContainEqual(
      expect.objectContaining({
        event: "diagnostic_request_succeeded",
        requestMode: "default-current",
      }),
    );
    expect(JSON.stringify(sentPayloads)).not.toMatch(
      /latitude|longitude|coords/,
    );
  });

  it("고정밀 1회 요청에만 위치 옵션을 전달한다", () => {
    render(<LocationDiagnosticsPanel isEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "고정밀 1회 요청" }));

    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10_000,
      },
    );
  });

  it("브라우저가 콜백을 주지 않으면 무응답으로 구분한다", () => {
    vi.useFakeTimers();
    render(<LocationDiagnosticsPanel isEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "기본 1회 요청" }));
    act(() => {
      vi.advanceTimersByTime(12_000);
    });

    expect(screen.getByText(/request-unresponsive/)).toBeDefined();
    const sentPayloads = fetchMock.mock.calls.map(([, options]) =>
      JSON.parse(String(options.body)),
    );
    expect(sentPayloads).toContainEqual(
      expect.objectContaining({
        event: "diagnostic_request_unresponsive",
        requestMode: "default-current",
      }),
    );
  });

  it("홈 재현 모드는 pending watch를 숨김에서 제거하고 복귀 시 자동 재생성한다", () => {
    const watchPosition = vi.mocked(navigator.geolocation.watchPosition);
    const clearWatch = vi.mocked(navigator.geolocation.clearWatch);
    render(<LocationDiagnosticsPanel isEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "홈 잠금 복귀 재현" }));
    expect(watchPosition).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(clearWatch).toHaveBeenCalledWith(1);
    expect(
      screen.getByText(/home-simulation-watch-cleared-while-pending/),
    ).toBeDefined();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(watchPosition).toHaveBeenCalledTimes(2);
    expect(
      screen.getByText(/home-simulation-watch-auto-resumed/),
    ).toBeDefined();

    const sentPayloads = fetchMock.mock.calls.map(([, options]) =>
      JSON.parse(String(options.body)),
    );
    expect(sentPayloads).toContainEqual(
      expect.objectContaining({
        event: "diagnostic_request_started",
        requestMode: "home-lifecycle-watch",
      }),
    );
  });

  it("records location success even when the permission query does not resolve", async () => {
    vi.mocked(navigator.permissions.query).mockReturnValue(
      new Promise(() => {}),
    );
    getCurrentPosition.mockImplementation((onSuccess: PositionCallback) => {
      onSuccess({
        coords: {
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 37.5,
          longitude: 127,
          speed: null,
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      });
    });
    render(<LocationDiagnosticsPanel isEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "기본 1회 요청" }));

    await waitFor(() => {
      expect(screen.getByText(/request-success/)).toBeDefined();
    });
  });

  it("records clipboard failures without an unhandled rejection", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
      new Error("clipboard denied"),
    );
    render(<LocationDiagnosticsPanel isEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "결과 복사" }));

    await waitFor(() => {
      expect(screen.getByText(/result-copy-error/)).toBeDefined();
      expect(screen.getByText(/clipboard denied/)).toBeDefined();
    });
  });
});
