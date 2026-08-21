import { describe, expect, it } from "vitest";
import { resolveLoginRequest } from "./server-login-guard";

const AUTHENTICATED_COOKIE = `auth-storage=${encodeURIComponent(
  JSON.stringify({ state: { isAuthenticated: true }, version: 0 }),
)}`;

const SIGNED_OUT_COOKIE = `auth-storage=${encodeURIComponent(
  JSON.stringify({ state: { isAuthenticated: false }, version: 0 }),
)}`;

const documentRequest = (url: string, cookie?: string) =>
  new Request(url, {
    headers: {
      Accept: "text/html",
      "Sec-Fetch-Dest": "document",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

describe("resolveLoginRequest", () => {
  it("로그인 상태로 로그인 문서를 요청하면 returnPath로 돌려보낸다", () => {
    const response = resolveLoginRequest(
      documentRequest(
        "https://zimdugo.com/login?returnPath=%2Fnotices",
        AUTHENTICATED_COOKIE,
      ),
    );

    expect(response?.status).toBe(302);
    expect(response?.headers.get("Location")).toBe("/notices");
    expect(response?.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returnPath가 없으면 홈으로 돌려보낸다", () => {
    const response = resolveLoginRequest(
      documentRequest("https://zimdugo.com/login", AUTHENTICATED_COOKIE),
    );

    expect(response?.headers.get("Location")).toBe("/");
  });

  it("로케일 경로에서는 로케일을 유지한 채 돌려보낸다", () => {
    expect(
      resolveLoginRequest(
        documentRequest("https://zimdugo.com/ja/login", AUTHENTICATED_COOKIE),
      )?.headers.get("Location"),
    ).toBe("/ja");

    expect(
      resolveLoginRequest(
        documentRequest(
          "https://zimdugo.com/zh-TW/login?returnPath=%2Fnotices",
          AUTHENTICATED_COOKIE,
        ),
      )?.headers.get("Location"),
    ).toBe("/zh-TW/notices");
  });

  it("외부 URL이 returnPath로 들어와도 홈으로만 보낸다", () => {
    expect(
      resolveLoginRequest(
        documentRequest(
          "https://zimdugo.com/login?returnPath=https%3A%2F%2Fevil.com",
          AUTHENTICATED_COOKIE,
        ),
      )?.headers.get("Location"),
    ).toBe("/");
  });

  it("OAuth 콜백은 통과시킨다 — 이 요청으로 로그인이 완료된다", () => {
    expect(
      resolveLoginRequest(
        documentRequest(
          "https://zimdugo.com/login?code=LOGIN_SUCCESS&returnPath=%2F",
          AUTHENTICATED_COOKIE,
        ),
      ),
    ).toBeNull();
  });

  it("비로그인 요청은 통과시킨다", () => {
    expect(
      resolveLoginRequest(documentRequest("https://zimdugo.com/login")),
    ).toBeNull();

    expect(
      resolveLoginRequest(
        documentRequest("https://zimdugo.com/login", SIGNED_OUT_COOKIE),
      ),
    ).toBeNull();
  });

  it("로그인 페이지가 아닌 문서 요청은 건드리지 않는다", () => {
    expect(
      resolveLoginRequest(
        documentRequest("https://zimdugo.com/notices", AUTHENTICATED_COOKIE),
      ),
    ).toBeNull();
  });

  it("문서 요청이 아니면 건드리지 않는다", () => {
    expect(
      resolveLoginRequest(
        new Request("https://zimdugo.com/login", {
          headers: { Cookie: AUTHENTICATED_COOKIE },
        }),
      ),
    ).toBeNull();
  });

  it("쿠키가 깨져 있으면 통과시킨다", () => {
    expect(
      resolveLoginRequest(
        documentRequest("https://zimdugo.com/login", "auth-storage=not-json"),
      ),
    ).toBeNull();
  });
});
