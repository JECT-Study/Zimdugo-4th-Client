import { describe, expect, it } from "vitest";
import {
  resolveProtectedRequest,
  withProtectedDocumentHeaders,
} from "./server-protected-route-guard";

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

describe("resolveProtectedRequest", () => {
  it("로그인 상태면 보호 경로 문서를 그대로 통과시킨다", () => {
    expect(
      resolveProtectedRequest(
        documentRequest("https://zimdugo.com/report", AUTHENTICATED_COOKIE),
      ),
    ).toBeNull();
  });

  it.each(["/report", "/my/reports", "/my/favorites"])(
    "비로그인 상태로 %s 문서를 요청하면 홈으로 돌려보낸다",
    (pathname) => {
      const response = resolveProtectedRequest(
        documentRequest(`https://zimdugo.com${pathname}`, SIGNED_OUT_COOKIE),
      );

      expect(response?.status).toBe(302);
      expect(response?.headers.get("Location")).toBe("/");
    },
  );

  it("쿠키가 아예 없으면 비로그인으로 보고 돌려보낸다", () => {
    const response = resolveProtectedRequest(
      documentRequest("https://zimdugo.com/report"),
    );

    expect(response?.status).toBe(302);
  });

  it("로케일 접두사를 유지한 채 그 로케일의 홈으로 보낸다", () => {
    const response = resolveProtectedRequest(
      documentRequest("https://zimdugo.com/ja/my/reports", SIGNED_OUT_COOKIE),
    );

    expect(response?.headers.get("Location")).toBe("/ja");
  });

  it("끝에 슬래시가 붙어도 같은 경로로 본다", () => {
    const response = resolveProtectedRequest(
      documentRequest("https://zimdugo.com/report/", SIGNED_OUT_COOKIE),
    );

    expect(response?.status).toBe(302);
  });

  it("로그인 여부로 응답이 갈리므로 캐시를 막는다", () => {
    const response = resolveProtectedRequest(
      documentRequest("https://zimdugo.com/report", SIGNED_OUT_COOKIE),
    );

    expect(response?.headers.get("Cache-Control")).toBe("no-store");
  });

  it("보호 경로가 아니면 관여하지 않는다", () => {
    expect(
      resolveProtectedRequest(
        documentRequest("https://zimdugo.com/notices", SIGNED_OUT_COOKIE),
      ),
    ).toBeNull();
  });

  it("`/my` 는 설정으로 보내는 호환 경로이므로 막지 않는다", () => {
    expect(
      resolveProtectedRequest(
        documentRequest("https://zimdugo.com/my", SIGNED_OUT_COOKIE),
      ),
    ).toBeNull();
  });

  it("문서 요청이 아니면 관여하지 않는다", () => {
    const assetRequest = new Request("https://zimdugo.com/report", {
      headers: { Accept: "application/json", Cookie: SIGNED_OUT_COOKIE },
    });

    expect(resolveProtectedRequest(assetRequest)).toBeNull();
  });
});

describe("withProtectedDocumentHeaders", () => {
  const html = (body = "<!doctype html>") =>
    new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

  it("통과시킨 보호 문서 응답에도 no-store 를 남긴다", () => {
    const response = withProtectedDocumentHeaders(
      documentRequest("https://zimdugo.com/report", AUTHENTICATED_COOKIE),
      html(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("본문과 나머지 헤더는 그대로 둔다", async () => {
    const response = withProtectedDocumentHeaders(
      documentRequest("https://zimdugo.com/my/reports", AUTHENTICATED_COOKIE),
      html("<!doctype html><p>제보</p>"),
    );

    expect(await response.text()).toBe("<!doctype html><p>제보</p>");
    expect(response.headers.get("Content-Type")).toBe("text/html");
  });

  it("헤더가 불변인 응답도 감싸서 처리한다", () => {
    const immutable = Response.redirect("https://zimdugo.com/", 302);

    expect(() =>
      withProtectedDocumentHeaders(
        documentRequest("https://zimdugo.com/report", AUTHENTICATED_COOKIE),
        immutable,
      ),
    ).not.toThrow();
  });

  it("보호 경로가 아니면 응답을 그대로 돌려준다", () => {
    const original = html();
    const response = withProtectedDocumentHeaders(
      documentRequest("https://zimdugo.com/notices", AUTHENTICATED_COOKIE),
      original,
    );

    expect(response).toBe(original);
    expect(response.headers.get("Cache-Control")).toBeNull();
  });
});
