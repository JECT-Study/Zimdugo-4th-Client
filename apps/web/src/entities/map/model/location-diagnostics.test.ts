import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCATION_DIAGNOSTICS_ENDPOINT,
  postLocationDiagnostic,
} from "./location-diagnostics";

describe("위치 진단 클라이언트", () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));

  beforeEach(() => {
    fetchMock.mockClear();
    window.history.replaceState({}, "", "/");
    window.sessionStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window.crypto, "randomUUID").mockReturnValue(
      "123e4567-e89b-42d3-a456-426614174000",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("locationDebug가 없으면 진단 이벤트를 보내지 않는다", () => {
    postLocationDiagnostic("tracking_request_started");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("locationDebug가 켜지면 식별 정보 없이 진단 이벤트를 보낸다", () => {
    window.history.replaceState({}, "", "/?locationDebug=1");

    postLocationDiagnostic("tracking_watch_error", {
      elapsedMs: 10_000,
      errorCode: 3,
      hasSessionRequestMarker: true,
      isLocating: false,
      isTracking: false,
      permission: "prompt",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(LOCATION_DIAGNOSTICS_ENDPOINT);
    expect(options).toMatchObject({
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
    });

    const payload = JSON.parse(String(options.body));
    expect(payload).toMatchObject({
      version: 1,
      diagnosticId: "123e4567-e89b-42d3-a456-426614174000",
      event: "tracking_watch_error",
      errorCode: 3,
    });
    expect(payload).not.toHaveProperty("latitude");
    expect(payload).not.toHaveProperty("longitude");
    expect(payload).not.toHaveProperty("userId");
  });

  it("locationDebug=0이면 같은 세션의 진단을 끈다", () => {
    window.history.replaceState({}, "", "/?locationDebug=1");
    postLocationDiagnostic("tracking_request_started");
    window.history.replaceState({}, "", "/?locationDebug=0");
    postLocationDiagnostic("tracking_watch_started");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
