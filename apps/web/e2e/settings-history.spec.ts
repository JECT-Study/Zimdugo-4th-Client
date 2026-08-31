import { expect, type Page, test } from "@playwright/test";

/**
 * 설정 화면을 오갈 때 브라우저 히스토리가 쌓이지 않는지 본다.
 *
 * 하위 화면으로 들어가는 것은 실제 깊이라 한 칸을 쓴다. 그러나 되돌아가는 길은
 * 그 칸을 되감아야지, 지정 이동으로 새 항목을 밀어 넣으면 오갈 때마다 스택이
 * 자란다. 그러면 앱을 빠져나가려고 뒤로가기를 여러 번 눌러야 한다.
 *
 * 언어 전환도 같은 화면을 다른 언어로 다시 여는 것이라 항목을 쌓으면 안 된다.
 * 쌓으면 뒤로가기가 이전 화면이 아니라 예전 언어로 되돌아간다.
 *
 * history.length 는 jsdom 에서 움직이지 않으므로 브라우저로만 잡을 수 있다.
 */

const apiEnvelope = (data: unknown) => ({
  code: "SUCCESS",
  message: "ok",
  status: 200,
  timestamp: new Date().toISOString(),
  data,
});

/** 약관·개인정보·공지는 문서 목록을 배열로 받는다. */
const documentsRaw = (type: string) => [
  {
    id: 1,
    type,
    title: type === "NOTICE" ? "공지 1" : "문서 1",
    appliedAt: "2026-08-01T00:00:00",
    imageUrl: null,
    imageUrls: null,
    sections: [{ subtitle: "소제목", content: "내용" }],
  },
];

const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", (route) => {
    const url = route.request().url();
    const type = new URL(url).searchParams.get("type") ?? "NOTICE";

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        apiEnvelope(
          url.includes("/documents") ? documentsRaw(type) : { items: [] },
        ),
      ),
    });
  });
};

const historyLength = (page: Page) => page.evaluate(() => history.length);

// 로케일 전환은 문서를 다시 띄운다. 페이지 안에서 읽으면 그 이동에 실행 맥락이
// 사라져 폴링이 깨지므로 바깥에서 본다.
const currentPath = (page: Page) => new URL(page.url()).pathname;

/**
 * 화면 안 헤더의 뒤로가기를 누른다.
 *
 * window.history.back() 으로 대신하면 그 버튼이 지정 이동으로 구현돼 있어도
 * 테스트가 통과한다. 고치려던 자리를 건너뛰는 셈이라 버튼을 직접 누른다.
 */
const pressHeaderBack = async (page: Page) => {
  await page.getByRole("button", { name: "뒤로가기" }).first().click();
};

/** 기기 뒤로가기. 화면 안 버튼과 결과가 같아야 한다. */
const pressDeviceBack = async (page: Page) => {
  await page.evaluate(() => window.history.back());
};

const openSettingsRow = async (page: Page, name: RegExp) => {
  await page.getByRole("button", { name }).first().click();
};

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

test.describe("설정 화면과 브라우저 히스토리", () => {
  test("같은 하위 화면을 여러 번 오가도 히스토리가 한 칸을 넘지 않는다", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: /테마 설정/ })).toBeVisible();

    const baseline = await historyLength(page);

    for (let round = 0; round < 5; round += 1) {
      await openSettingsRow(page, /테마 설정/);
      await expect.poll(() => currentPath(page)).toContain("/settings/theme");

      await pressHeaderBack(page);
      await expect.poll(() => currentPath(page)).toMatch(/\/settings$/);
    }

    expect(
      await historyLength(page),
      "오갈 때마다 쌓이면 앱을 빠져나가려고 뒤로가기를 그만큼 더 눌러야 한다",
    ).toBeLessThanOrEqual(baseline + 1);

    // 길이만 보면 앞으로 갈 자리를 덮어쓰는 구현도 통과한다. 헤더 뒤로가기가
    // 정말 되감았다면 기기 뒤로가기 한 번으로 설정을 벗어나야 한다.
    await pressDeviceBack(page);
    await expect.poll(() => currentPath(page)).not.toMatch(/\/settings$/);
  });

  test("약관·개인정보·공지에서 뒤로가면 설정으로 곧장 돌아온다", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: /테마 설정/ })).toBeVisible();

    const baseline = await historyLength(page);

    for (const [name, expectedPath] of [
      [/이용약관|약관/, "/settings/terms"],
      [/개인정보/, "/settings/privacy"],
      [/공지/, "/notices"],
    ] as const) {
      await openSettingsRow(page, name);
      await expect.poll(() => currentPath(page)).toContain(expectedPath);

      await pressHeaderBack(page);
      await expect.poll(() => currentPath(page)).toMatch(/\/settings$/);
    }

    expect(await historyLength(page)).toBeLessThanOrEqual(baseline + 1);

    await pressDeviceBack(page);
    await expect.poll(() => currentPath(page)).not.toMatch(/\/settings$/);
  });

  test("언어를 바꿔도 히스토리가 늘지 않고 뒤로가기가 설정으로 간다", async ({
    page,
  }) => {
    // 설정에서 들어와야 뒤로 돌아갈 자리가 생긴다. 언어 화면부터 바로 열면
    // 되돌아갈 곳이 브라우저의 빈 문서라 무엇을 확인해도 뜻이 없다.
    await page.goto("/settings");
    await openSettingsRow(page, /언어 설정/);
    await expect(page.getByRole("button", { name: /English/ })).toBeVisible();

    const baseline = await historyLength(page);

    await page.getByRole("button", { name: /English/ }).first().click();
    // 로케일 전환은 문서를 다시 띄운다. 그 이동이 끝나기 전에는 페이지 안을
    // 들여다볼 수 없다.
    await page.waitForURL(/\/en\//);
    await page.waitForLoadState("domcontentloaded");

    expect(
      await historyLength(page),
      "언어 전환이 항목을 쌓으면 뒤로가기가 예전 언어로 되돌아간다",
    ).toBe(baseline);

    await pressDeviceBack(page);
    await page.waitForLoadState("domcontentloaded");
    await expect.poll(() => currentPath(page)).toMatch(/\/settings$/);
  });
});
