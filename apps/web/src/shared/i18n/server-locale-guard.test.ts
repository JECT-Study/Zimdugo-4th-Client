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

/** 실제 리다이렉트가 심어준 마커를 그대로 돌려준다. `name=value` 한 쌍이다. */
const issueIntentCookie = (url: string): string => {
  const result = resolveLocaleRequest(createDocumentRequest(url));
  if (result.kind !== "redirect") throw new Error("expected a redirect");

  const setCookie = result.response.headers.get("Set-Cookie");
  if (!setCookie) throw new Error("expected an intent marker");

  return setCookie.split(";")[0];
};

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
    // 마커는 목적지에 묶여 그 요청에서만 소비된다. 이름은 리다이렉트별 nonce 다.
    expect(setCookie).toMatch(
      new RegExp(
        `^ZIMDUGO_LOCALE_INTENT_[0-9a-f]{32}=${encodeURIComponent("/settings?tab=1").replace(/[?]/g, "\\?")}`,
      ),
    );
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

  it("collapses leading slashes so the redirect cannot leave the origin", () => {
    // 접두사를 떼면 //evil.example/x 가 되어 프로토콜 상대 URL 로 해석된다.
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/ko//evil.example/x"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/evil.example/x");
  });

  it("keeps the base locale when the intent marker survived the redirect", () => {
    // Accept-Language 만 보면 en 이지만, 사용자가 /ko 링크로 들어왔다.
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: issueIntentCookie("https://zimdugo.com/ko/settings"),
      }),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.pathLocale).toBe("ko");
    expect(result.consumedLocaleIntent).toBe(true);
  });

  it("ignores a marker left for a different destination", () => {
    // 같은 브라우저에서 /ko/settings 리다이렉트와 /my 탐색이 겹친 상황.
    // /my 가 남의 마커를 삼키면 한국어로 렌더되고, 마커가 지워져 원래
    // /settings 요청은 다시 Accept-Language 로 끌려간다.
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/my", {
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: issueIntentCookie("https://zimdugo.com/ko/settings"),
      }),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/en/my");
  });

  it("gives every redirect its own marker, same destination included", () => {
    // 같은 /ko/a 를 두 탭에서 열어도 마커가 겹치면 안 된다. 겹치면 먼저
    // 소비한 쪽의 Max-Age=0 이 아직 쓰이지 않은 다른 탭의 마커까지 지운다.
    const first = issueIntentCookie("https://zimdugo.com/ko/a");
    const second = issueIntentCookie("https://zimdugo.com/ko/a");

    expect(first.split("=")[0]).not.toBe(second.split("=")[0]);

    // 소비 응답은 자기가 찾은 마커 하나만 지운다.
    const response = withConsumedLocaleIntentHeaders(
      createDocumentRequest("https://zimdugo.com/a", {
        Cookie: [first, second].join("; "),
      }),
      new Response("ok", { status: 200 }),
    );

    const cleared = response.headers.get("Set-Cookie") ?? "";
    const clearedName = cleared.split("=")[0];

    expect([first.split("=")[0], second.split("=")[0]]).toContain(clearedName);
    expect(cleared).toContain("Max-Age=0");
    // 남은 마커는 그대로라 두 번째 탭도 한국어를 받는다.
    const survivor = [first, second].find(
      (cookie) => cookie.split("=")[0] !== clearedName,
    );
    const secondTab = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/a", {
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: survivor ?? "",
      }),
    );

    expect(secondTab.kind).toBe("continue");
    if (secondTab.kind !== "continue") return;

    expect(secondTab.pathLocale).toBe("ko");
  });

  it("keeps markers for different destinations independent", () => {
    const cookies = [
      issueIntentCookie("https://zimdugo.com/ko/a"),
      issueIntentCookie("https://zimdugo.com/ko/b"),
    ];

    const browserCookie = cookies.join("; ");

    for (const path of ["/a", "/b"]) {
      const result = resolveLocaleRequest(
        createDocumentRequest(`https://zimdugo.com${path}`, {
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: browserCookie,
        }),
      );

      expect(result.kind).toBe("continue");
      if (result.kind !== "continue") return;

      expect(result.pathLocale).toBe("ko");
      expect(result.consumedLocaleIntent).toBe(true);
    }
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
      createDocumentRequest("https://zimdugo.com/settings", {
        Cookie: issueIntentCookie("https://zimdugo.com/ko/settings"),
      }),
      new Response("ok", { status: 200 }),
    );

    const setCookie = response.headers.get("Set-Cookie");
    // 소비한 마커만 지운다.
    expect(setCookie).toMatch(/^ZIMDUGO_LOCALE_INTENT_[0-9a-f]{32}=;/);
    expect(setCookie).toContain("Max-Age=0");
    expect(response.headers.get("Vary")).toBe("Cookie, Accept-Language");
  });
});
