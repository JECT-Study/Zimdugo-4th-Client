import { afterEach, describe, expect, it, vi } from "vitest";
import { handleLocationDiagnosticRequest } from "./location-diagnostics-server";

const DIAGNOSTIC_URL =
  "https://feature-branch.vercel.app/_internal/location-diagnostics";

const createPayload = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  diagnosticId: "123e4567-e89b-42d3-a456-426614174000",
  event: "tracking_watch_error",
  timestamp: 1_700_000_000_000,
  visibilityState: "visible",
  elapsedMs: 10_000,
  errorCode: 3,
  hasSessionRequestMarker: true,
  isLocating: false,
  isTracking: false,
  permission: "prompt",
  ...overrides,
});

const createRequest = (payload: Record<string, unknown>) =>
  new Request(DIAGNOSTIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://feature-branch.vercel.app",
    },
    body: JSON.stringify(payload),
  });

describe("location diagnostics server", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preview에서는 검증된 진단 이벤트를 구조화 로그로 남긴다", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const response = await handleLocationDiagnosticRequest(
      createRequest(createPayload()),
      { VERCEL_ENV: "preview" },
    );

    expect(response?.status).toBe(204);
    expect(consoleWarn).toHaveBeenCalledWith(
      "[location-diagnostic]",
      expect.stringContaining('"event":"tracking_watch_error"'),
    );
  });

  it("production에서는 명시적인 환경 변수로만 엔드포인트를 연다", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const response = await handleLocationDiagnosticRequest(
      createRequest(createPayload()),
      {
        VERCEL_ENV: "production",
        LOCATION_DIAGNOSTICS_ENABLED: "true",
      },
    );

    expect(response?.status).toBe(204);
    expect(consoleWarn).toHaveBeenCalledOnce();
  });

  it("성공 이벤트는 info 레벨로 남긴다", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    const response = await handleLocationDiagnosticRequest(
      createRequest(createPayload({ event: "tracking_first_position" })),
      { VERCEL_ENV: "preview" },
    );

    expect(response?.status).toBe(204);
    expect(consoleInfo).toHaveBeenCalledOnce();
  });

  it("production에서는 환경 변수가 없으면 엔드포인트를 숨긴다", async () => {
    const response = await handleLocationDiagnosticRequest(
      createRequest(createPayload()),
      { VERCEL_ENV: "production" },
    );

    expect(response?.status).toBe(404);
  });

  it("좌표나 임의 필드가 포함된 payload를 거부한다", async () => {
    const response = await handleLocationDiagnosticRequest(
      createRequest(createPayload({ latitude: 37.5, longitude: 127 })),
      { VERCEL_ENV: "preview" },
    );

    expect(response?.status).toBe(400);
  });

  it("다른 origin의 전송을 거부한다", async () => {
    const request = createRequest(createPayload());
    request.headers.set("Origin", "https://example.com");

    const response = await handleLocationDiagnosticRequest(request, {
      VERCEL_ENV: "preview",
    });

    expect(response?.status).toBe(403);
  });
});
