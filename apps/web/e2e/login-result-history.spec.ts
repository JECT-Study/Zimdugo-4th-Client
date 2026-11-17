import { expect, type Page, test } from "@playwright/test";

/**
 * 로그인을 마친 뒤 뒤로가기로 제공자 페이지에 돌아가 다시 눌러도
 * 로그인 실패를 알리지 않는지 본다.
 *
 * 로그인 결과 칸(`/login?code=…`)은 replace 로 지워지지만 그 앞의 제공자
 * 페이지(구글 계정 선택 등)는 히스토리에 남는다. 거기서 다시 누르면 서버의
 * 인증 요청은 이미 쓰여 소멸했으므로 LOGIN_FAILED 로 돌아온다. 로그인 상태는
 * 그대로이니 실패 모달 없이 목적지로 가야 한다.
 *
 * 진짜 제공자와 백엔드 대신, 백엔드의 동작을 그대로 흉내 내는 가짜 경계를 둔다.
 * - `/oauth2/authorization/*` : callbackUrl 을 기억하고 가짜 제공자 페이지를 연다
 * - `/login/oauth2/code/*`    : 인증 요청을 한 번만 받아 주고, 두 번째부터는 실패로 돌려보낸다
 *
 * 히스토리 복원과 뒤로가기는 jsdom 에서 재현되지 않으므로 브라우저로만 잡을 수 있다.
 */

const LOGIN_FAILURE_TITLE = "로그인에 실패했습니다";
const LOGIN_SUCCESS_TITLE = "로그인이 확인되었습니다";
const PROVIDER_BUTTON = "가짜 제공자 계정 선택";

const apiEnvelope = (data: unknown) => ({
  code: "SUCCESS",
  message: "ok",
  status: 200,
  timestamp: new Date().toISOString(),
  data,
});

const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope({ items: [] })),
    }),
  );

  await page.route("**/api/auth/refresh", (route) =>
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

/**
 * 백엔드의 OAuth 시작·콜백과 제공자 페이지를 흉내 낸다.
 *
 * 실제 백엔드처럼 시작 요청이 남긴 인증 요청은 콜백에서 한 번 쓰이면 사라진다.
 * 그래서 같은 제공자 페이지에서 다시 누르면 LOGIN_FAILED 로 돌아온다.
 */
const stubOAuthBoundary = async (page: Page) => {
  let callbackUrl: string | null = null;
  let hasPendingAuthRequest = false;

  await page.route("**/oauth2/authorization/**", (route) => {
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

  await page.route("**/__e2e-provider/authorize", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html><meta charset="utf-8"><title>provider</title>
<a href="/login/oauth2/code/google?code=provider-code&state=e2e">${PROVIDER_BUTTON}</a>`,
    }),
  );

  await page.route("**/login/oauth2/code/**", (route) => {
    if (!callbackUrl) throw new Error("OAuth 시작 요청 없이 콜백이 왔다");

    const result = hasPendingAuthRequest ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
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
const recordFailureModal = async (page: Page) => {
  await page.addInitScript((failureTitle) => {
    const w = window as typeof window & { __loginFailureShown?: boolean };
    w.__loginFailureShown = false;

    new MutationObserver(() => {
      if (document.body?.innerText.includes(failureTitle)) {
        w.__loginFailureShown = true;
      }
    }).observe(document, { childList: true, subtree: true, characterData: true });
  }, LOGIN_FAILURE_TITLE);
};

const hasFailureModalShown = (page: Page) =>
  page.evaluate(
    () =>
      (window as typeof window & { __loginFailureShown?: boolean })
        .__loginFailureShown === true,
  );

const currentPath = (page: Page) => new URL(page.url()).pathname;

// 화면 문구로 모달을 찾으므로 언어를 고정한다. 기기 기본값(영어)이면 다른 문구가 뜬다.
test.use({ locale: "ko-KR" });

test.beforeEach(async ({ page }) => {
  await stubApi(page);
  await stubOAuthBoundary(page);
  await recordFailureModal(page);
});

test.describe("로그인 결과와 브라우저 히스토리", () => {
  test("로그인 직후 뒤로가기로 제공자 페이지에서 다시 눌러도 실패를 알리지 않고 목적지로 간다", async ({
    page,
  }) => {
    await page.goto("/login?returnPath=%2Fsettings");
    await page.getByRole("link", { name: /구글 1초 로그인/ }).click();

    // 첫 로그인: 제공자 페이지에서 계정을 고르면 성공해 목적지에 닿는다.
    await page.getByRole("link", { name: PROVIDER_BUTTON }).click();
    await expect.poll(() => currentPath(page)).toBe("/settings");
    await expect(page.getByText(LOGIN_SUCCESS_TITLE)).toBeVisible();
    await expect(page.getByRole("button", { name: /로그아웃/ })).toBeVisible();

    // 결과 칸은 지워졌으므로 뒤로가기 한 번이면 제공자 페이지다.
    await page.goBack();
    await expect(page.getByRole("link", { name: PROVIDER_BUTTON })).toBeVisible();

    // 다시 누르면 서버의 인증 요청은 이미 소멸해 LOGIN_FAILED 로 돌아온다.
    await page.getByRole("link", { name: PROVIDER_BUTTON }).click();

    await expect.poll(() => currentPath(page)).toBe("/settings");
    await expect(page.getByRole("button", { name: /로그아웃/ })).toBeVisible();
    expect(new URL(page.url()).searchParams.has("code")).toBe(false);
    expect(
      await hasFailureModalShown(page),
      "로그인 상태인데 실패 모달이 뜨면 사용자는 로그인이 풀린 줄 안다",
    ).toBe(false);
  });

  test("로그인하지 않은 상태로 LOGIN_FAILED 를 받으면 실패를 알리고 로그인 화면에 남는다", async ({
    page,
  }) => {
    // 위 테스트가 실패 모달을 못 잡아서 통과하는 것이 아님을 확인한다.
    await page.goto("/login?returnPath=%2Fsettings&code=LOGIN_FAILED");

    await expect(page.getByText(LOGIN_FAILURE_TITLE)).toBeVisible();
    await expect.poll(() => currentPath(page)).toBe("/login");
    expect(await hasFailureModalShown(page)).toBe(true);
  });
});
