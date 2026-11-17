import type { BrowserContext, Page } from "@playwright/test";

/**
 * 진짜 제공자와 백엔드 대신, 백엔드의 OAuth 동작을 그대로 흉내 내는 가짜 경계.
 *
 * - `/oauth2/authorization/*` : callbackUrl 을 기억하고 가짜 제공자 페이지로 넘긴다
 * - `/__e2e-provider/authorize`: 계정 선택 버튼 하나뿐인 가짜 제공자 페이지
 * - `/login/oauth2/code/*`     : 인증 요청을 한 번만 받아 주고, 두 번째부터는 실패로 돌려보낸다
 *
 * 경로는 컨텍스트에 건다. 로그인 팝업도 같은 컨텍스트의 새 페이지라 함께 가로채진다.
 */

export const LOGIN_FAILURE_TITLE = "로그인에 실패했습니다";
export const LOGIN_SUCCESS_TITLE = "로그인이 확인되었습니다";
export const PROVIDER_BUTTON = "가짜 제공자 계정 선택";

const apiEnvelope = (data: unknown) => ({
  code: "SUCCESS",
  message: "ok",
  status: 200,
  timestamp: new Date().toISOString(),
  data,
});

export const stubApi = async (context: BrowserContext) => {
  await context.route("**/api/v1/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope({ items: [] })),
    }),
  );

  await context.route("**/api/auth/refresh", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        apiEnvelope({
          accessToken: "e2e-access-token",
          userId: 1,
          email: "e2e@example.com",
          provider: "google",
        }),
      ),
    }),
  );
};

interface OAuthBoundaryOptions {
  /** 제공자가 인증을 거절한 경우처럼, 첫 콜백부터 실패로 돌려보낸다. */
  isRejected?: boolean;
}

export const stubOAuthBoundary = async (
  context: BrowserContext,
  { isRejected = false }: OAuthBoundaryOptions = {},
) => {
  let callbackUrl: string | null = null;
  let hasPendingAuthRequest = false;

  await context.route("**/oauth2/authorization/**", (route) => {
    callbackUrl = new URL(route.request().url()).searchParams.get(
      "callbackUrl",
    );
    hasPendingAuthRequest = true;

    // 실제 백엔드처럼 제공자 주소로 넘긴다. 뒤로가기는 제공자 페이지만 다시
    // 불러야 한다. 여기서 바로 페이지를 돌려주면 뒤로가기가 이 시작 요청을 다시
    // 보내 인증 요청이 되살아나고, 두 번째 클릭도 성공해 버린다.
    // 302 로 넘기면 Playwright 가 이어지는 요청을 가로채지 않으므로,
    // 히스토리에 남지 않는 location.replace 로 같은 효과를 낸다.
    return route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html><script>location.replace("/__e2e-provider/authorize")</script>`,
    });
  });

  await context.route("**/__e2e-provider/authorize", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html><meta charset="utf-8"><title>provider</title>
<a href="/login/oauth2/code/google?code=provider-code&state=e2e">${PROVIDER_BUTTON}</a>`,
    }),
  );

  await context.route("**/login/oauth2/code/**", (route) => {
    if (!callbackUrl) throw new Error("OAuth 시작 요청 없이 콜백이 왔다");

    const result =
      hasPendingAuthRequest && !isRejected ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
    hasPendingAuthRequest = false;

    const location = new URL(callbackUrl);
    location.searchParams.set("code", result);

    return route.fulfill({
      status: 302,
      headers: { location: location.toString() },
    });
  });
};

/**
 * 실패 모달이 한순간이라도 떴는지 문서마다 기록한다.
 *
 * 모달은 2초 뒤 저절로 닫히고, 화면을 옮기면 사라진다. 도착한 뒤에
 * "보이지 않는다" 만 확인하면 이미 떴다 사라진 경우도 통과한다.
 */
export const recordFailureModal = async (context: BrowserContext) => {
  await context.addInitScript((failureTitle) => {
    const w = window as typeof window & { __loginFailureShown?: boolean };
    w.__loginFailureShown = false;

    new MutationObserver(() => {
      if (document.body?.innerText.includes(failureTitle)) {
        w.__loginFailureShown = true;
      }
    }).observe(document, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }, LOGIN_FAILURE_TITLE);
};

export const hasFailureModalShown = (page: Page) =>
  page.evaluate(
    () =>
      (window as typeof window & { __loginFailureShown?: boolean })
        .__loginFailureShown === true,
  );

/** 팝업이 막힌 브라우저처럼 window.open 이 null 을 돌려주게 한다. */
export const blockPopups = async (context: BrowserContext) => {
  await context.addInitScript(() => {
    window.open = () => null;
  });
};

export const currentPath = (page: Page) => new URL(page.url()).pathname;
