import { describe, expect, it } from "vitest";

import {
  resolveLocaleRequest,
  withConsumedLocaleIntentHeaders,
  withForwardedLocaleIntent,
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
  it("표기가 다른 로케일 접두사를 정규 표기로 되돌린다", () => {
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

  it("대문자 로케일 접두사를 정규 표기로 되돌린다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/EN"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/en");
  });

  it("정규 표기 접두사는 그대로 둔다", () => {
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

  it("접두사 없는 문서 요청은 선호 로케일로 보낸다", () => {
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

  it("로케일 선호 쿠키를 쓰지 않는다", () => {
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

  it("base locale 이면 접두사 없는 문서 요청을 그대로 둔다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        Cookie: "PARAGLIDE_LOCALE=ko",
      }),
    );

    expect(result.kind).toBe("continue");
    if (result.kind !== "continue") return;

    expect(result.pathLocale).toBeNull();
  });

  it("문서가 아닌 요청도 로케일 표기를 정규화한다", () => {
    const result = resolveLocaleRequest(
      new Request("https://zimdugo.com/zh-tw/settings"),
    );

    expect(result.kind).toBe("redirect");
  });

  it("base locale 접두사를 떼면서 의도 마커를 실어 보낸다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/ko/settings?tab=1", {
        "Accept-Language": "en-US,en;q=0.9",
      }),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/settings?tab=1");

    const setCookie = result.response.headers.get("Set-Cookie");
    // 이름은 리다이렉트별 nonce, 값은 목적지의 고정 크기 해시다.
    expect(setCookie).toMatch(/^ZIMDUGO_LOCALE_INTENT_[0-9a-f]{32}=[0-9a-z]+;/);
    expect(setCookie).toContain("Max-Age=10");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    // 마커는 선호 채널이 아니다.
    expect(setCookie).not.toContain("PARAGLIDE_LOCALE=");
  });

  it("같은 리다이렉트에서 base locale 표기도 정규화한다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/KO/settings"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/settings");
  });

  it("앞선 슬래시를 접어 리다이렉트가 출처를 벗어나지 못하게 한다", () => {
    // 접두사를 떼면 //evil.example/x 가 되어 프로토콜 상대 URL 로 해석된다.
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/ko//evil.example/x"),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/evil.example/x");
  });

  it("의도 마커가 살아 왔으면 base locale 을 유지한다", () => {
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

  it("다른 목적지 앞으로 남은 마커는 무시한다", () => {
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

  it("목적지가 같아도 리다이렉트마다 마커를 따로 준다", () => {
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

  it("목적지가 다른 마커끼리는 서로 건드리지 않는다", () => {
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

  it("마커가 사라지면 다시 Accept-Language 를 본다", () => {
    const result = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        "Accept-Language": "en-US,en;q=0.9",
      }),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    expect(result.response.headers.get("Location")).toBe("/en/settings");
  });

  it("문서가 아닌 요청은 base locale 접두사를 그대로 둔다", () => {
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
  it("마커를 지우고 로케일을 정한 채널을 Vary 에 남긴다", () => {
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

describe("withForwardedLocaleIntent", () => {
  const createAuthRedirect = (location: string) =>
    new Response(null, { status: 302, headers: { Location: location } });

  it("인증 가드가 만든 목적지에도 의도를 이어 준다", () => {
    // /ko/report 를 비로그인으로 열면 보호 가드가 "/" 로 돌려보낸다. 마커를
    // 이어주지 않으면 그 "/" 요청이 다시 Accept-Language 로 넘어간다.
    const req = createDocumentRequest("https://zimdugo.com/report", {
      Cookie: issueIntentCookie("https://zimdugo.com/ko/report"),
    });

    const response = withForwardedLocaleIntent(req, createAuthRedirect("/"));
    const cookies = response.headers.getSetCookie();

    // 소비한 마커는 지우고, 목적지 앞으로 새 마커를 남긴다.
    expect(cookies.some((cookie) => cookie.includes("Max-Age=0"))).toBe(true);

    const forwarded = cookies.find((cookie) => cookie.includes("Max-Age=10"));
    expect(forwarded).toBeDefined();

    // 목적지 요청은 영어 브라우저에서도 한국어로 이어진다.
    const next = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/", {
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: (forwarded ?? "").split(";")[0],
      }),
    );

    expect(next.kind).toBe("continue");
    if (next.kind !== "continue") return;

    expect(next.pathLocale).toBe("ko");
  });

  it("이미 로케일을 담은 목적지에는 마커를 붙이지 않는다", () => {
    const req = createDocumentRequest("https://zimdugo.com/report", {
      Cookie: issueIntentCookie("https://zimdugo.com/ko/report"),
    });

    const response = withForwardedLocaleIntent(req, createAuthRedirect("/ja"));

    // 소비한 마커는 지우되 새 마커는 남기지 않는다. 목적지 URL 이 이미 ja 다.
    expect(
      response.headers.getSetCookie().some((c) => c.includes("Max-Age=10")),
    ).toBe(false);
    expect(
      response.headers.getSetCookie().some((c) => c.includes("Max-Age=0")),
    ).toBe(true);
  });

  it("출처 밖 목적지에는 마커를 붙이지 않는다", () => {
    const req = createDocumentRequest("https://zimdugo.com/report", {
      Cookie: issueIntentCookie("https://zimdugo.com/ko/report"),
    });

    const response = withForwardedLocaleIntent(
      req,
      createAuthRedirect("https://evil.example/x"),
    );

    expect(
      response.headers.getSetCookie().some((c) => c.includes("Max-Age=10")),
    ).toBe(false);
  });
});

describe("라우터가 만든 리다이렉트의 withForwardedLocaleIntent", () => {
  it("라우트가 만든 리다이렉트에도 의도를 이어 준다", () => {
    // /ko/my → /my 로 마커를 받은 뒤, 라우터가 /settings 로 다시 보낸다.
    const req = createDocumentRequest("https://zimdugo.com/my", {
      Cookie: issueIntentCookie("https://zimdugo.com/ko/my"),
    });

    const response = withForwardedLocaleIntent(
      req,
      new Response(null, { status: 302, headers: { Location: "/settings" } }),
    );

    const forwarded = response.headers
      .getSetCookie()
      .find((cookie) => cookie.includes("Max-Age=10"));

    const next = resolveLocaleRequest(
      createDocumentRequest("https://zimdugo.com/settings", {
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: (forwarded ?? "").split(";")[0],
      }),
    );

    expect(next.kind).toBe("continue");
    if (next.kind !== "continue") return;

    expect(next.pathLocale).toBe("ko");
  });

  it("그냥 렌더된 응답에서는 마커만 지운다", () => {
    const req = createDocumentRequest("https://zimdugo.com/settings", {
      Cookie: issueIntentCookie("https://zimdugo.com/ko/settings"),
    });

    const response = withForwardedLocaleIntent(
      req,
      new Response("ok", { status: 200 }),
    );

    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(response.headers.get("Vary")).toBe("Cookie, Accept-Language");
  });
});

describe("로케일 의도 마커의 크기와 헤더", () => {
  it("목적지가 아주 길어도 마커는 작게 유지한다", () => {
    // returnPath 는 길이 제한이 없다. 목적지를 그대로 담으면 쿠키 크기 제한을
    // 넘겨 브라우저가 마커를 저장하지 않는다.
    const returnPath = `/${"a".repeat(8000)}`;
    const result = resolveLocaleRequest(
      createDocumentRequest(
        `https://zimdugo.com/ko/login?returnPath=${encodeURIComponent(returnPath)}`,
      ),
    );

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;

    const setCookie = result.response.headers.get("Set-Cookie") ?? "";
    expect(setCookie.length).toBeLessThan(200);

    // 크기를 줄여도 목적지 대조는 그대로 동작한다.
    const location = result.response.headers.get("Location") ?? "";
    const next = resolveLocaleRequest(
      createDocumentRequest(`https://zimdugo.com${location}`, {
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: setCookie.split(";")[0],
      }),
    );

    expect(next.kind).toBe("continue");
    if (next.kind !== "continue") return;

    expect(next.pathLocale).toBe("ko");
  });

  it("이미 있는 Vary 를 덮지 않고 합친다", () => {
    const response = withConsumedLocaleIntentHeaders(
      createDocumentRequest("https://zimdugo.com/settings", {
        Cookie: issueIntentCookie("https://zimdugo.com/ko/settings"),
      }),
      new Response("ok", {
        status: 200,
        headers: { Vary: "Accept-Encoding" },
      }),
    );

    const vary = response.headers.get("Vary") ?? "";
    expect(vary).toContain("Accept-Encoding");
    expect(vary).toContain("Cookie");
    expect(vary).toContain("Accept-Language");
  });

  it("와일드카드 Vary 는 그대로 둔다", () => {
    const response = withConsumedLocaleIntentHeaders(
      createDocumentRequest("https://zimdugo.com/settings", {
        Cookie: issueIntentCookie("https://zimdugo.com/ko/settings"),
      }),
      new Response("ok", { status: 200, headers: { Vary: "*" } }),
    );

    expect(response.headers.get("Vary")).toBe("*");
  });
});
