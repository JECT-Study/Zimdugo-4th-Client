import { expect, test } from "@playwright/test";
import {
  blockPopups,
  currentPath,
  hasFailureModalShown,
  LOGIN_SUCCESS_TITLE,
  PROVIDER_BUTTON,
  recordFailureModal,
  stubApi,
  stubOAuthBoundary,
} from "./support/oauth-boundary";

/**
 * 로그인을 마친 뒤 뒤로가기로 제공자 페이지에 돌아가 다시 눌러도
 * 로그인 실패를 알리지 않는지 본다.
 *
 * 로그인 결과 칸(`/login?code=…`)은 replace 로 지워지지만 그 앞의 제공자
 * 페이지(구글 계정 선택 등)는 히스토리에 남는다. 거기서 다시 누르면 서버의
 * 인증 요청은 이미 쓰여 소멸했으므로 LOGIN_FAILED 로 돌아온다. 로그인 상태는
 * 그대로이니 실패 모달 없이 목적지로 가야 한다.
 *
 * 평소에는 로그인이 팝업에서 진행돼 이 창의 히스토리에 제공자 페이지가 쌓이지
 * 않는다. 여기서는 팝업이 막혀 같은 창에서 진행되는 경우를 본다.
 * 가짜 OAuth 경계는 `support/oauth-boundary.ts` 에 있다.
 *
 * 히스토리 복원과 뒤로가기는 jsdom 에서 재현되지 않으므로 브라우저로만 잡을 수 있다.
 */

// 화면 문구로 모달을 찾으므로 언어를 고정한다. 기기 기본값(영어)이면 다른 문구가 뜬다.
test.use({ locale: "ko-KR" });

let oauth: Awaited<ReturnType<typeof stubOAuthBoundary>>;

test.beforeEach(async ({ context }) => {
  await stubApi(context);
  oauth = await stubOAuthBoundary(context);
  await recordFailureModal(context);
  await blockPopups(context);
});

test.describe("팝업이 막혀 같은 창에서 로그인할 때", () => {
  test("로그인 직후 뒤로가기로 제공자 페이지에서 다시 눌러도 실패를 알리지 않고 목적지로 간다", async ({
    page,
  }) => {
    await page.goto("/login?returnPath=%2Fsettings");
    await page.getByRole("link", { name: /구글 1초 로그인/ }).click();

    // 첫 로그인: 제공자 페이지에서 계정을 고르면 성공해 목적지에 닿는다.
    // 팝업이 막혀 같은 창으로 넘어가는 길에서도 시작 요청은 한 번이어야 한다.
    await expect(page.getByRole("link", { name: PROVIDER_BUTTON })).toBeVisible();
    expect(oauth.getAuthorizationRequestCount()).toBe(1);
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

    // 실패 모달은 2초 뒤 저절로 닫힌다. 화면이 늦게 뜨면 보이는 순간을 놓치므로
    // 떴던 기록으로 확인한다.
    await expect.poll(() => hasFailureModalShown(page)).toBe(true);
    await expect.poll(() => currentPath(page)).toBe("/login");
  });
});
