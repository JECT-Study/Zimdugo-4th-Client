import { describe, expect, it, vi } from "vitest";
import { normalizeApiBaseUrl, resolveApiBaseUrl } from "./api-base-url";

describe("normalizeApiBaseUrl", () => {
  it("normalizes duplicate protocol and path slashes", () => {
    expect(normalizeApiBaseUrl("https:////api.example.com//v1//")).toBe(
      "https://api.example.com/v1",
    );
  });

  it("trims trailing slashes from the origin", () => {
    expect(normalizeApiBaseUrl(" https://api.example.com// ")).toBe(
      "https://api.example.com",
    );
  });

  it("accepts protocol-relative URLs as https", () => {
    expect(normalizeApiBaseUrl("//api.example.com//v1")).toBe(
      "https://api.example.com/v1",
    );
  });

  it("rejects unsupported protocols", () => {
    expect(normalizeApiBaseUrl("ftp://api.example.com")).toBeNull();
  });
});

describe("resolveApiBaseUrl", () => {
  it("prefers VITE_API_BASE_URL on the server", () => {
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

  it("falls back to API_BASE_URL on the server", () => {
    expect(
      resolveApiBaseUrl({
        isServer: true,
        env: { API_BASE_URL: "https://api.example.com//v1//" },
      }),
    ).toBe("https://api.example.com/v1");
  });

  it("falls back without throwing when the server base URL is missing", () => {
    const reportWarning = vi.fn();

    expect(resolveApiBaseUrl({ isServer: true, reportWarning })).toBe("");
    expect(reportWarning).toHaveBeenCalledWith({
      code: "api_base_url_missing",
      message:
        "API base URL is not defined. Falling back to relative API paths.",
    });
  });

  it("falls back without throwing when the base URL is invalid", () => {
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

  it("removes credentials and query strings from invalid URL previews", () => {
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
});
