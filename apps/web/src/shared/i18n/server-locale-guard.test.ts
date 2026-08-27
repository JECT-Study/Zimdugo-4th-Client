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

  it("기록한다: 언어 선택 경로로 들어온 요청", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest(
        "https://zimdugo.com/set-language/ja/settings/language",
      ),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe(
      "/ja/settings/language",
    );
    expect(result.response.headers.get("Set-Cookie")).toContain(
      "PARAGLIDE_LOCALE=ja",
    );
    // 쿠키를 심는 응답이라 한 사람 것이다.
    expect(result.response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("기본 로케일을 골라도 기록하고, 낡은 쿠키에 끌려가지 않는다", () => {
    // 선택을 먼저 처리하지 않으면 여기서 사고가 난다. 쿠키가 아직 en 이라
    // 선호 리다이렉트가 사용자를 /en 으로 도로 데려간다.
    const result = resolveLocaleRequest(
      createDocumentRequest(
        "https://zimdugo.com/set-language/ko/settings/language",
        { Cookie: "PARAGLIDE_LOCALE=en" },
      ),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/settings/language");
    expect(result.response.headers.get("Set-Cookie")).toContain(
      "PARAGLIDE_LOCALE=ko",
    );
  });

  it("쿼리를 들고 원래 자리로 돌려보낸다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest(
        "https://zimdugo.com/set-language/ja/settings?tab=1",
      ),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/ja/settings?tab=1");
  });

  it("홈으로 돌아가는 선택도 자리를 잃지 않는다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/set-language/en"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/en");
  });

  it("모르는 로케일이면 선택으로 보지 않는다", () => {
    // 남이 만든 링크로 남의 로케일이 선호로 굳으면 안 된다.
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/set-language/fr/settings"),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.middlewareRequest.url).toBe(
      "https://zimdugo.com/set-language/fr/settings",
    );
  });

  it("로케일처럼 시작하는 낱말은 선택으로 보지 않는다", () => {
    // normalizeLocale 은 Accept-Language 의 en-US 를 받으려고 접두사 일치를
    // 쓴다. 그걸 경로에 그대로 대면 아래가 전부 통과해 버린다.
    for (const segment of ["english", "javascript", "korean", "zhuge"]) {
      const result = resolveLocaleRequest(
        createDocumentRequest(
          `https://zimdugo.com/set-language/${segment}/settings`,
        ),
      );

      expect(result.kind).toBe("continue");
    }
  });

  it("표기만 다른 로케일 조각은 받아 준다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/set-language/zh-tw/settings"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/zh-TW/settings");
  });

  it("문서 요청이 아니면 선택 경로를 보지 않는다", () => {
    const result = resolveLocaleRequest(
      new Request("https://zimdugo.com/set-language/ja/settings"),
    );

    expect(result.kind).toBe("continue");
  });

  it("normalizes locale casing for non-document requests too", () => {
    const result = resolveLocaleRequest(
      new Request("https://zimdugo.com/zh-tw/settings"),
    );

    expect(result.kind).toBe("redirect");
  });
});
