import { describe, expect, it } from "vitest";

import { resolveLocaleRequest } from "./server-locale-guard";

const createDocumentRequest = (
  url: string,
  headers: Record<string, string> = {},
) =>
  new Request(url, {
    headers: { "Sec-Fetch-Dest": "document", ...headers },
  });

describe("resolveLocaleRequest", () => {
  it("redirects a non-canonical locale prefix to its canonical casing", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/zh-tw/settings?tab=1"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.status).toBe(307);
    expect(result.response.headers.get("Location")).toBe(
      "/zh-TW/settings?tab=1",
    );
    expect(result.response.headers.get("Set-Cookie")).toContain(
      "PARAGLIDE_LOCALE=zh-TW",
    );
  });

  it("redirects an uppercase locale prefix to its canonical casing", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/EN"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/en");
  });

  it("keeps a canonical locale prefix as is", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/zh-TW/settings"),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.pathLocale).toBe("zh-TW");
    expect(result.middlewareRequest.headers.get("Cookie")).toContain(
      "PARAGLIDE_LOCALE=zh-TW",
    );
  });

  it("still redirects locale-less document requests to the preferred locale", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        Cookie: "PARAGLIDE_LOCALE=ja",
      }),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/ja/settings");
  });

  it("leaves locale-less document requests alone for the base locale", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        Cookie: "PARAGLIDE_LOCALE=ko",
      }),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.pathLocale).toBeNull();
  });

  it("normalizes locale casing for non-document requests too", () => {
    const result = resolveLocaleRequest(
      new Request("https://zimdugo.com/zh-tw/settings"),
    );

    expect(result.kind).toBe("redirect");
  });
});
