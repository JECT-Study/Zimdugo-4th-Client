import { describe, expect, it, vi } from "vitest";
import {
  normalizeApiBaseUrl,
  resolveApiBaseUrl,
  shouldBlockServerRelativeApiRequest,
} from "./api-base-url";

describe("normalizeApiBaseUrl", () => {
  it("프로토콜과 경로의 겹친 슬래시를 정리한다", () => {
    expect(normalizeApiBaseUrl("https:////api.example.com//v1//")).toBe(
      "https://api.example.com/v1",
    );
  });

  it("기준 주소 끝의 슬래시를 걷어낸다", () => {
    expect(normalizeApiBaseUrl(" https://api.example.com// ")).toBe(
      "https://api.example.com",
    );
  });

  it("요청 경로가 /api 로 시작해도 슬래시가 겹치지 않는다", () => {
    expect(normalizeApiBaseUrl("https://api.zimdugo.com/")).toBe(
      "https://api.zimdugo.com",
    );
  });

  it("프로토콜 상대 주소는 https 로 받는다", () => {
    expect(normalizeApiBaseUrl("//api.example.com//v1")).toBe(
      "https://api.example.com/v1",
    );
  });

  it("지원하지 않는 프로토콜은 받지 않는다", () => {
    expect(normalizeApiBaseUrl("ftp://api.example.com")).toBeNull();
  });
});

describe("resolveApiBaseUrl", () => {
  it("서버에서는 VITE_API_BASE_URL 을 먼저 본다", () => {
    expect(
      resolveApiBaseUrl({
        isServer: true,
        env: {
          API_BASE_URL: "https://api.example.com",
          VITE_API_BASE_URL: "https://vite.example.com//",
        },
      }),
    ).toBe("https://vite.example.com");
  });

  it("서버에서 없으면 API_BASE_URL 로 물러선다", () => {
    expect(
      resolveApiBaseUrl({
        isServer: true,
        env: { API_BASE_URL: "https://api.example.com//v1//" },
      }),
    ).toBe("https://api.example.com/v1");
  });

  it("서버 기준 주소가 없어도 던지지 않고 물러선다", () => {
    const reportWarning = vi.fn();

    expect(resolveApiBaseUrl({ isServer: true, reportWarning })).toBe("");
    expect(reportWarning).toHaveBeenCalledWith({
      code: "api_base_url_missing",
      message:
        "API base URL is not defined. Falling back to relative API paths.",
    });
  });

  it("기준 주소가 잘못돼도 던지지 않고 물러선다", () => {
    const reportWarning = vi.fn();

    expect(
      resolveApiBaseUrl({
        isServer: true,
        env: { API_BASE_URL: "not a url" },
        reportWarning,
      }),
    ).toBe("");
    expect(reportWarning).toHaveBeenCalledWith({
      code: "api_base_url_invalid",
      message: "Invalid API base URL. Falling back to relative API paths.",
      details: {
        valuePreview: "not a url",
      },
    });
  });

  it("잘못된 주소를 보여 줄 때 자격 증명과 쿼리를 지운다", () => {
    const reportWarning = vi.fn();

    expect(
      resolveApiBaseUrl({
        isServer: true,
        env: { API_BASE_URL: "ftp://user:pass@api.example.com/path?token=abc" },
        reportWarning,
      }),
    ).toBe("");
    expect(reportWarning).toHaveBeenCalledWith({
      code: "api_base_url_invalid",
      message: "Invalid API base URL. Falling back to relative API paths.",
      details: {
        valuePreview: "ftp://api.example.com/path",
      },
    });
  });

  it("주소 파싱이 실패해도 미리보기를 안전하게 만든다", () => {
    const reportWarning = vi.fn();

    expect(
      resolveApiBaseUrl({
        isServer: true,
        env: {
          API_BASE_URL: "user:pass@api.example.com/path?token=abc#secret",
        },
        reportWarning,
      }),
    ).toBe("");
    expect(reportWarning).toHaveBeenCalledWith({
      code: "api_base_url_invalid",
      message: "Invalid API base URL. Falling back to relative API paths.",
      details: {
        valuePreview: "api.example.com/path",
      },
    });
  });
});

describe("shouldBlockServerRelativeApiRequest", () => {
  it("기준 주소가 없으면 서버의 /api 요청을 막는다", () => {
    expect(
      shouldBlockServerRelativeApiRequest({
        isServer: true,
        baseUrl: "",
        requestPath: "/api/v1/lockers/seo-list",
      }),
    ).toBe(true);
  });

  it("기준 주소가 절대 주소면 서버 API 요청을 허용한다", () => {
    expect(
      shouldBlockServerRelativeApiRequest({
        isServer: true,
        baseUrl: "https://api.example.com",
        requestPath: "/api/v1/lockers/seo-list",
      }),
    ).toBe(false);
  });

  it("클라이언트의 같은 출처 API 요청은 허용한다", () => {
    expect(
      shouldBlockServerRelativeApiRequest({
        isServer: false,
        baseUrl: "",
        requestPath: "/api/v1/lockers/seo-list",
      }),
    ).toBe(false);
  });
});
