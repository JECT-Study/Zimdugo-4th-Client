import { expect, type Page, test } from "@playwright/test";
import {
  currentPath,
  hasFailureModalShown,
  LOGIN_SUCCESS_TITLE,
  PROVIDER_BUTTON,
  recordFailureModal,
  stubApi,
  stubOAuthBoundary,
} from "./support/oauth-boundary";

/**
 * 소셜 로그인을 팝업 창에서 진행하고, 끝나면 원래 창에서 결과를 반영하는지 본다.
 *
 * 팝업은 결과를 BroadcastChannel 로 알리고 스스로 닫힌다. 원래 창은 토큰을 받아
 * 목적지로 간다. 로그인 과정이 팝업 안에서만 오가므로 원래 창은 제공자 페이지를
 * 한 번도 거치지 않아야 한다. 그래야 뒤로가기로 제공자 페이지에 돌아갈 일이 없다.
 *
 * 창 사이의 연락과 창 닫기는 jsdom 에서 재현되지 않으므로 브라우저로만 잡을 수 있다.
 */

/** 원래 창이 지나간 주소를 모은다. 제공자나 OAuth 주소가 섞이면 안 된다. */
const recordMainNavigations = (page: Page) => {
  const urls: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) urls.push(frame.url());
  });

  return urls;
};

const openLoginPopup = async (page: Page) => {
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: /구글 1초 로그인/ }).click();
  const popup = await popupPromise;
  await expect(popup.getByRole("link", { name: PROVIDER_BUTTON })).toBeVisible();

  return popup;
};

// 화면 문구로 모달을 찾으므로 언어를 고정한다. 기기 기본값(영어)이면 다른 문구가 뜬다.
test.use({ locale: "ko-KR" });

test.describe("팝업 로그인", () => {
  test("팝업에서 로그인을 마치면 팝업이 닫히고 원래 창이 목적지로 간다", async ({
    context,
    page,
  }) => {
    await stubApi(context);
    await stubOAuthBoundary(context);
    await recordFailureModal(context);

    await page.goto("/login?returnPath=%2Fsettings");
    const mainNavigations = recordMainNavigations(page);

    const popup = await openLoginPopup(page);
    const popupClosed = popup.waitForEvent("close");
    await popup.getByRole("link", { name: PROVIDER_BUTTON }).click();
    await popupClosed;

    await expect.poll(() => currentPath(page)).toBe("/settings");
    await expect(page.getByText(LOGIN_SUCCESS_TITLE)).toBeVisible();
    await expect(page.getByRole("button", { name: /로그아웃/ })).toBeVisible();

    expect(
      mainNavigations.filter((url) =>
        /oauth2|__e2e-provider|[?&]code=/.test(url),
      ),
      "원래 창이 제공자나 결과 주소를 거치면 뒤로가기로 그 페이지에 돌아갈 수 있다",
    ).toEqual([]);
  });

  test("팝업에서 로그인이 실패하면 팝업이 닫히고 원래 창이 실패를 알린 채 로그인 화면에 남는다", async ({
    context,
    page,
  }) => {
    await stubApi(context);
    await stubOAuthBoundary(context, { isRejected: true });
    await recordFailureModal(context);

    await page.goto("/login?returnPath=%2Fsettings");

    const popup = await openLoginPopup(page);
    const popupClosed = popup.waitForEvent("close");
    await popup.getByRole("link", { name: PROVIDER_BUTTON }).click();
    await popupClosed;

    // 실패 모달은 2초 뒤 저절로 닫힌다. 화면이 늦게 뜨면 보이는 순간을 놓치므로
    // 떴던 기록으로 확인한다.
    await expect.poll(() => hasFailureModalShown(page)).toBe(true);
    await expect.poll(() => currentPath(page)).toBe("/login");
  });

  test("팝업에서 로그인하는 동안 원래 창이 로그인 화면을 떠나면 팝업이 직접 로그인을 마친다", async ({
    context,
    page,
  }) => {
    await stubApi(context);
    await stubOAuthBoundary(context);

    await page.goto("/login?returnPath=%2Fsettings");
    const popup = await openLoginPopup(page);

    // 결과를 받을 화면이 사라진다. 팝업이 확인 없이 닫히면 로그인이 사라진다.
    await page.goto("/notices");

    let isPopupClosed = false;
    popup.on("close", () => {
      isPopupClosed = true;
    });
    await popup.getByRole("link", { name: PROVIDER_BUTTON }).click();

    await expect.poll(() => currentPath(popup)).toBe("/settings");
    await expect(popup.getByText(LOGIN_SUCCESS_TITLE)).toBeVisible();
    await expect(popup.getByRole("button", { name: /로그아웃/ })).toBeVisible();
    expect(isPopupClosed).toBe(false);
  });

  test("팝업이 열려 있을 때 다시 누르면 앞의 팝업을 닫고 새 팝업으로 로그인을 마친다", async ({
    context,
    page,
  }) => {
    await stubApi(context);
    await stubOAuthBoundary(context);
    await recordFailureModal(context);

    await page.goto("/login?returnPath=%2Fsettings");
    const firstPopup = await openLoginPopup(page);
    const firstPopupClosed = firstPopup.waitForEvent("close");

    // 모바일에서는 팝업이 탭이라, 사용자가 실수로 원래 탭에 돌아와 다시 누를 수 있다.
    // 열린 팝업을 앞으로 가져오는 방식은 iOS Safari 에서 아무 반응이 없으므로
    // 다시 누르면 언제나 새 팝업이 떠야 한다.
    const secondPopupPromise = page.waitForEvent("popup");
    await page.getByRole("link", { name: /카카오 1초 로그인/ }).click();
    const secondPopup = await secondPopupPromise;
    await firstPopupClosed;
    await expect(
      secondPopup.getByRole("link", { name: PROVIDER_BUTTON }),
    ).toBeVisible();

    const secondPopupClosed = secondPopup.waitForEvent("close");
    await secondPopup.getByRole("link", { name: PROVIDER_BUTTON }).click();
    await secondPopupClosed;

    await expect.poll(() => currentPath(page)).toBe("/settings");
    await expect(page.getByRole("button", { name: /로그아웃/ })).toBeVisible();
    expect(await hasFailureModalShown(page)).toBe(false);
  });
});
