import { describe, expect, it } from "vitest";

import {
  resolveLocaleRequest,
  withConsumedLocaleIntentHeaders,
} from "./server-locale-guard";

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

  it("strips the base locale prefix and carries the intent marker", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/ko/settings?tab=1", {
        "Accept-Language": "en-US,en;q=0.9",
      }),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/settings?tab=1");

    const setCookie = result.response.headers.get("Set-Cookie");
    expect(setCookie).toContain("ZIMDUGO_LOCALE_INTENT=1");
    expect(setCookie).toContain("Max-Age=10");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    // 마커는 선호 채널이 아니다.
    expect(setCookie).not.toContain("PARAGLIDE_LOCALE=");
  });

  it("normalizes base locale casing in the same redirect", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/KO/settings"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/settings");
  });

  it("keeps the base locale when the intent marker survived the redirect", () => {
    // Accept-Language 만 보면 en 이지만, 사용자가 /ko 링크로 들어왔다.
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "ZIMDUGO_LOCALE_INTENT=1",
      }),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.pathLocale).toBe("ko");
    expect(result.consumedLocaleIntent).toBe(true);
  });

  it("still applies Accept-Language once the marker is gone", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        "Accept-Language": "en-US,en;q=0.9",
      }),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/en/settings");
  });

  it("leaves the base locale prefix alone for non-document requests", () => {
    // 문서 요청이 아니면 브라우저 주소가 바뀌지 않아 마커를 소비할 기회가 없다.
    const result = resolveLocaleRequest(
      new Request("https://zimdugo.com/ko/settings"),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.pathLocale).toBe("ko");
    expect(result.consumedLocaleIntent).toBe(false);
  });
});

describe("withConsumedLocaleIntentHeaders", () => {
  it("clears the marker and varies on the channels that decided the locale", () => {
    const response = withConsumedLocaleIntentHeaders(
      createDocumentRequest("https://zimdugo.com/settings"),
      new Response("ok", { status: 200 }),
    );

    const setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).toContain("ZIMDUGO_LOCALE_INTENT=;");
    expect(setCookie).toContain("Max-Age=0");
    expect(response.headers.get("Vary")).toBe("Cookie, Accept-Language");
  });
});
