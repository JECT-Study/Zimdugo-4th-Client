import { expect, type Page, test } from "@playwright/test";

/**
 * 홈 화면을 조작해도 브라우저 히스토리가 쌓이지 않는지 본다.
 *
 * 홈은 상세 시트·검색 컨텍스트·지도 뷰포트를 URL 검색 파라미터로 표현한다.
 * 이 표현을 push 로 갱신하면 시트를 여닫을 때마다 항목이 하나씩 늘고,
 * 뒤로가기로 복원된 URL 을 보고 시트가 다시 열리면서 또 push 가 일어난다.
 * 그러면 뒤로가기를 아무리 눌러도 제자리를 맴돈다. 실제로 그렇게 깨져 있었다.
 *
 * history.length 는 jsdom 에서 움직이지 않으므로 브라우저로만 잡을 수 있다.
 */

const LOCKER_ID = 500;
const OTHER_LOCKER_ID = 501;

const lockerDetailRaw = (lockerId: number) => ({
  lockerId,
  lockerName: `보관함 ${lockerId}`,
  roadAddress: "서울 강남구 강남대로 지하 396",
  latitude: lockerId === LOCKER_ID ? 37.4979 : 37.4989,
  longitude: lockerId === LOCKER_ID ? 127.0276 : 127.0286,
  lockerType: "SUBWAY",
  updatedAt: "2026-08-01T00:00:00",
  distanceMeters: 120,
  minPrice: 2000,
  maxPrice: 4000,
  isFavorite: false,
  floor: 1,
  groundLevelType: "UNDERGROUND",
  lockerSizes: ["SMALL", "MEDIUM"],
  detailInfo: "개찰구를 지나 왼쪽",
  accurateVoteCount: 10,
  inaccurateVoteCount: 1,
});

const pinsRaw = [LOCKER_ID, OTHER_LOCKER_ID].map((lockerId) => ({
  pinType: "LOCKER",
  lockerId,
  placeId: null,
  latitude: lockerId === LOCKER_ID ? 37.4979 : 37.4989,
  longitude: lockerId === LOCKER_ID ? 127.0276 : 127.0286,
  isFavorite: false,
  lockerCount: null,
  pinCount: null,
  bounds: null,
  markerStatus: "DEFAULT",
}));

const apiEnvelope = (data: unknown) => ({
  code: "SUCCESS",
  message: "ok",
  status: 200,
  timestamp: new Date().toISOString(),
  data,
});

const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const lockerIdMatch = url.match(/\/lockers\/(\d+)/);
    const data = url.includes("/pins")
      ? { items: pinsRaw }
      : lockerIdMatch
        ? lockerDetailRaw(Number(lockerIdMatch[1]))
        : url.includes("/search") || url.includes("/suggest")
          ? { count: 0, items: [], hasNext: false }
          : {};

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope(data)),
    });
  });
};

const waitForMapReady = async (page: Page) => {
  await expect(page.locator('[data-map-state="ready"]')).toBeAttached();
};

/**
 * 지도 마커를 누른다.
 *
 * 마커는 지도 SDK 가 얹은 오버레이 아래에 깔려 있어 Playwright 의 탭이
 * 닿지 않는다. SDK 가 실제로 듣는 이벤트를 마커 요소에 직접 보낸다.
 */
const pressMarker = async (page: Page, index: number) => {
  const pressed = await page.evaluate((markerIndex) => {
    const marker =
      document.querySelectorAll(".map-marker-offset-wrapper")[markerIndex];
    if (!marker) return false;

    const box = marker.getBoundingClientRect();
    const clientX = box.x + box.width / 2;
    const clientY = box.y + box.height / 2;
    const send = (
      type: string,
      Ctor: typeof PointerEvent | typeof MouseEvent | typeof TouchEvent,
      init: Record<string, unknown> = {},
    ) =>
      marker.dispatchEvent(
        new Ctor(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          ...init,
        }),
      );

    const pointer = { pointerType: "touch", isPrimary: true, clientX, clientY };
    send("pointerdown", PointerEvent, pointer);
    send("touchstart", TouchEvent);
    send("mousedown", MouseEvent, { clientX, clientY });
    send("pointerup", PointerEvent, pointer);
    send("touchend", TouchEvent);
    send("mouseup", MouseEvent, { clientX, clientY });
    send("click", MouseEvent, { clientX, clientY });
    return true;
  }, index);

  expect(pressed, "마커를 찾지 못했다").toBe(true);
};

/** 시트 위에 깔린 지도 오버레이가 실제 탭을 가로채므로 요소를 직접 누른다. */
const pressCloseButton = async (page: Page) => {
  const findCloseButton = () =>
    page.evaluate(
      () =>
        [...document.querySelectorAll("button")].some(
          (candidate) => candidate.getAttribute("aria-label") === "닫기",
        ),
    );

  // 상세 시트는 URL 이 바뀐 뒤 한 박자 늦게 올라온다.
  await expect.poll(findCloseButton).toBe(true);

  const pressed = await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find(
      (candidate) => candidate.getAttribute("aria-label") === "닫기",
    );
    if (!button) return false;

    button.click();
    return true;
  });

  expect(pressed, "닫기 버튼을 찾지 못했다").toBe(true);
};

/** 종료를 되묻는 토스트 문구. */
const EXIT_CONFIRM_TEXT = "한 번 더 누르면 앱을 나갑니다";

const historyLength = (page: Page) => page.evaluate(() => history.length);

const lockerParam = (page: Page) =>
  page.evaluate(() => new URLSearchParams(location.search).get("locker"));

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

test.describe("홈 화면과 브라우저 히스토리", () => {
  test("상세 시트를 여닫아도 히스토리가 늘지 않는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    const baseline = await historyLength(page);
    let afterFirstRound = 0;

    for (let round = 0; round < 3; round += 1) {
      await pressMarker(page, 0);
      await expect.poll(() => lockerParam(page)).not.toBeNull();

      await pressCloseButton(page);
      await expect.poll(() => lockerParam(page)).toBeNull();
      // 시트 닫힘 애니메이션이 끝나고 마커가 기본 상태로 돌아와야 다시 눌린다.
      await page.waitForTimeout(1_000);

      if (round === 0) {
        afterFirstRound = await historyLength(page);
      }
    }

    // 시트는 기기 뒤로가기로 닫을 수 있어야 하므로 열 때 한 칸을 쓴다. 닫을 때
    // 그 칸을 되감아 다시 쓰므로, 여닫기를 반복해도 더 자라지 않는다.
    expect(
      afterFirstRound,
      "시트 하나에 히스토리 한 칸을 넘게 쓰면 안 된다",
    ).toBeLessThanOrEqual(baseline + 1);
    expect(
      await historyLength(page),
      "상세를 여닫을 때마다 히스토리가 쌓이면 뒤로가기를 그만큼 더 눌러야 한다",
    ).toBe(afterFirstRound);
  });

  test("기기 뒤로가기가 상세 시트를 닫고 홈에 머무른다", async ({ page }) => {
    // 상세 응답을 늦춘다. 응답이 늦게 오면 시트가 닫힌 뒤에 제목 슬러그 정규화가
    // 돌아 URL 을 되살릴 수 있다. 빠른 스텁으로는 그 틈이 드러나지 않는다.
    await page.route("**/lockers/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      await route.fallback();
    });

    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    await pressMarker(page, 0);
    await expect.poll(() => lockerParam(page)).not.toBeNull();

    await page.evaluate(() => window.history.back());

    await expect.poll(() => lockerParam(page)).toBeNull();
    expect(page.url(), "뒤로가기 한 번에 앱을 벗어났다").toContain("localhost");

    // 늦게 도착한 상세 응답이 닫힌 시트를 되살리지 않아야 한다.
    await page.waitForTimeout(2_500);
    expect(
      await lockerParam(page),
      "늦게 온 상세 응답이 닫은 시트를 되살렸다",
    ).toBeNull();
  });

  test("기기 뒤로가기로 닫았다 다시 열어도 종료 확인이 살아 있다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    // 두 번째 여닫이가 첫 번째와 같은 칸을 써야 한다. 첫 닫힘이 남긴 흔적을
    // 보고 두 번째를 "같은 레이어"로 오해하면, 그때 종료 확인용 자리를 대신
    // 소비해 다음 뒤로가기가 토스트 없이 앱을 벗어난다.
    for (let round = 0; round < 2; round += 1) {
      await pressMarker(page, 0);
      await expect.poll(() => lockerParam(page)).not.toBeNull();

      await page.evaluate(() => window.history.back());
      await expect.poll(() => lockerParam(page)).toBeNull();
      await page.waitForTimeout(1_000);
    }

    await page.evaluate(() => window.history.back());

    await expect(page.getByText(EXIT_CONFIRM_TEXT)).toBeVisible();
    expect(page.url(), "되묻지 않고 그대로 나갔다").toContain("localhost");
  });

  test("홈 첫 화면에서는 뒤로가기를 한 번 되묻는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);

    await page.evaluate(() => window.history.back());

    await expect(page.getByText(EXIT_CONFIRM_TEXT)).toBeVisible();
    expect(page.url(), "되묻지 않고 그대로 나갔다").toContain("localhost");

    await page.evaluate(() => window.history.back());

    await expect
      .poll(() => page.url(), { timeout: 10_000 })
      .not.toContain("localhost");
  });

  test("새로고침한 상세를 닫아도 쌓아 둔 칸을 되감는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    await pressMarker(page, 0);
    await expect.poll(() => lockerParam(page)).not.toBeNull();

    // 상세 URL 에서 새로고침한다. 소유권을 컴포넌트가 들고 있으면 여기서 잊고,
    // 닫을 때 그 칸을 되감는 대신 현재 항목을 홈으로 덮는다. 그러면 종료 확인용
    // 자리 앞에 같은 홈이 하나 더 남아, 뒤로가기가 화면 변화 없이 그것을 먹는다.
    await page.reload();
    await waitForMapReady(page);
    await expect.poll(() => lockerParam(page)).not.toBeNull();

    await pressCloseButton(page);
    await expect.poll(() => lockerParam(page)).toBeNull();

    await page.evaluate(() => window.history.back());

    await expect(page.getByText(EXIT_CONFIRM_TEXT)).toBeVisible();
    expect(page.url(), "중복 항목을 헛돌다 나갔다").toContain("localhost");
  });

  test("되묻는 사이에 시트를 여닫아도 확인 없이 나가지 않는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    // 되묻기가 뜬 직후 시트를 여닫으면 종료 확인이 잠시 꺼진다. 그때 흘러간
    // 시간을 "두 번째 누름"으로 세면, 돌아와서 누른 첫 뒤로가기가 확인 없이
    // 앱을 벗어난다.
    await page.evaluate(() => window.history.back());
    await expect(page.getByText(EXIT_CONFIRM_TEXT)).toBeVisible();

    await pressMarker(page, 0);
    await expect.poll(() => lockerParam(page)).not.toBeNull();

    await page.evaluate(() => window.history.back());
    await expect.poll(() => lockerParam(page)).toBeNull();

    await page.evaluate(() => window.history.back());

    await expect(page.getByText(EXIT_CONFIRM_TEXT)).toBeVisible();
    expect(page.url(), "되묻지 않고 그대로 나갔다").toContain("localhost");
  });

  test("다른 마커로 상세를 옮겨도 히스토리가 늘지 않는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(1);

    await pressMarker(page, 0);
    await expect.poll(() => lockerParam(page)).not.toBeNull();

    const baseline = await historyLength(page);

    for (let round = 0; round < 3; round += 1) {
      await pressMarker(page, (round + 1) % 2);
      await page.waitForTimeout(500);
    }

    expect(await historyLength(page)).toBe(baseline);
  });
});
