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
    expect(result.response.headers.get("Set-Cookie")).toBeNull();
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
    // 로케일은 URL 로 해석되므로 가드가 요청을 손대지 않는다. 쿠키는 사용자가
    // 언어를 직접 고를 때만 기록되는 선호 채널이라, 가드가 덮어써서도 안 되고
    // 다른 쿠키를 흘려서도 안 된다.
    const cookie = "PARAGLIDE_LOCALE=en; session=abc123";
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/zh-TW/settings", { cookie }),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.pathLocale).toBe("zh-TW");
    expect(result.middlewareRequest.headers.get("Cookie")).toBe(cookie);
    expect(result.middlewareRequest.url).toBe(
      "https://zimdugo.com/zh-TW/settings",
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
    expect(result.response.headers.get("Vary")).toBe("Cookie, Accept-Language");
  });

  it("never writes the locale preference cookie", () => {
    const preferenceRedirect = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        "Accept-Language": "en-US,en;q=0.9",
      }),
    );

    expect(preferenceRedirect.kind).toBe("redirect");
    if (preferenceRedirect.kind !== "redirect") return;

    expect(preferenceRedirect.response.headers.get("Location")).toBe(
      "/en/settings",
    );
    // 로케일 링크 방문이나 Accept-Language 감지는 선호 기록이 아니다.
    expect(preferenceRedirect.response.headers.get("Set-Cookie")).toBeNull();
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
