import { expect, test } from "@playwright/test";

/**
 * 언어 전환이 스크립트 없이도 동작하는지 본다.
 *
 * 이 화면의 첫 클릭이 사라지던 원인은 두 가지였다(#152). 목록이 스켈레톤 뒤에
 * 있어 pointer-events 가 막혀 있었고, 행이 버튼이라 하이드레이션 전에는 핸들러가
 * 없었다. 둘 다 "화면은 다 그려졌는데 눌러도 반응이 없다" 로 보인다.
 *
 * JS 를 끈 브라우저는 그 순간을 그대로 재현한다. 여기서 통과하면 하이드레이션
 * 전 클릭도 통과한다.
 */
test.describe("언어 전환", () => {
  test.use({ javaScriptEnabled: false });

  test("스크립트 없이도 언어를 바꾼다", async ({ page }) => {
    await page.goto("/settings/language");

    // 스켈레톤이 아니라 실제 목록이 서버 응답에 들어 있어야 한다.
    const english = page.getByRole("link", { name: "English" });
    await expect(english).toBeVisible();

    await english.click();

    // 서버가 선택을 기록하고 로케일 자리로 돌려보낸다.
    await expect(page).toHaveURL(/\/en\/settings\/language$/);
    await expect(
      page.getByRole("link", { name: "English" }),
    ).toHaveAttribute("aria-current", "true");

    const cookies = await page.context().cookies();
    expect(
      cookies.find((cookie) => cookie.name === "PARAGLIDE_LOCALE")?.value,
    ).toBe("en");
  });

  test("기본 언어로 돌아올 때도 이전 선호에 끌려가지 않는다", async ({
    page,
  }) => {
    await page.goto("/en/settings/language");

    await page.getByRole("link", { name: "한국어" }).click();

    // prefix 없는 자리라 낡은 en 쿠키가 살아 있으면 /en 으로 도로 끌려간다.
    await expect(page).toHaveURL(/\/settings\/language$/);
    const cookies = await page.context().cookies();
    expect(
      cookies.find((cookie) => cookie.name === "PARAGLIDE_LOCALE")?.value,
    ).toBe("ko");
  });

  test("그냥 방문하는 것만으로는 선호가 기록되지 않는다", async ({ page }) => {
    await page.goto("/ja/settings/language");

    const cookies = await page.context().cookies();
    expect(
      cookies.find((cookie) => cookie.name === "PARAGLIDE_LOCALE"),
    ).toBeUndefined();
  });
});
