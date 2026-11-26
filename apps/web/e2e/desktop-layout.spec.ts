import { expect, type Page, test } from "@playwright/test";

/**
 * 데스크톱 레이아웃(1200px~)이 기능 플래그 뒤에서만 켜지는지, 켜졌을 때 왼쪽 카드와
 * 지도 컨트롤이 제자리에 놓이는지 본다.
 *
 * 카드 위치·컨트롤 위치는 실제 레이아웃이 있어야 잴 수 있다. 카메라가 카드를 피해
 * 비추는 계산은 단위 테스트(current-location·map-bounds·useMapCamera)가 맡는다.
 */

const LOCKER_ID = 500;
const VIEWPORT = { width: 1440, height: 900 } as const;
/** 화면 가장자리에서 카드·컨트롤까지 */
const DESKTOP_INSET_PX = 16;
/** 카드 폭 */
const DESKTOP_PANEL_WIDTH_PX = 400;
/** 시트가 없을 때 컨트롤이 놓이는 하단 자리 */
const BASE_BOTTOM_PX = 70;
/** 모바일 열 폭(600px~) */
const TABLET_APP_MAX_WIDTH_PX = 480;

const lockerDetailRaw = {
  lockerId: LOCKER_ID,
  lockerName: "강남역 4번 출구 물품보관함",
  roadAddress: "서울 강남구 강남대로 지하 396",
  latitude: 37.4979,
  longitude: 127.0276,
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
};

const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const data = url.includes("/pins")
      ? { items: [] }
      : url.includes(`/lockers/${LOCKER_ID}`)
        ? lockerDetailRaw
        : url.includes("/search") || url.includes("/suggest")
          ? { items: [], hasNext: false }
          : {};

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        code: "SUCCESS",
        message: "ok",
        status: 200,
        timestamp: new Date().toISOString(),
        data,
      }),
    });
  });
};

const mapControlStack = (page: Page) => page.locator("[data-map-control-stack]");
const sheetSurface = (page: Page) => page.locator("[data-bottom-sheet-surface]");
const searchInput = (page: Page) => page.getByLabel("검색어 입력");

const waitForMapReady = async (page: Page) => {
  await expect(page.locator('[data-map-state="ready"]')).toBeAttached();
};

/** 컨트롤 스택의 오른쪽 끝과 하단 자리 */
const controlPlacementOf = async (page: Page) => {
  await expect(mapControlStack(page)).toBeVisible();

  return mapControlStack(page).evaluate((element) => {
    const buttons = [...element.querySelectorAll("button")];
    const right = Math.max(
      ...buttons.map((button) => button.getBoundingClientRect().right),
    );

    return {
      right: Math.round(right),
      bottom: Number.parseFloat(getComputedStyle(element).bottom),
    };
  });
};

// 데스크톱은 마우스 환경이다. 터치 기기로 띄우면 기기 판별 스크립트가 끼어든다.
test.use({
  locale: "ko-KR",
  viewport: VIEWPORT,
  isMobile: false,
  hasTouch: false,
});

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

test.describe("데스크톱 레이아웃 플래그", () => {
  test("플래그가 꺼져 있으면 넓은 화면에서도 기존 가운데 열 그대로다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);

    expect(
      await page.evaluate(() =>
        document.documentElement.getAttribute("data-desktop-layout"),
      ),
    ).toBeNull();

    // 가운데 480px 열 안쪽 오른쪽 끝(여백 16)에 컨트롤이 있다.
    const columnRight = (VIEWPORT.width + TABLET_APP_MAX_WIDTH_PX) / 2;
    const { right } = await controlPlacementOf(page);
    expect(right).toBeLessThanOrEqual(columnRight);
  });

  test("?desktop=1 이면 왼쪽 위 카드와 오른쪽 아래 컨트롤로 놓인다", async ({
    page,
  }) => {
    await page.goto("/?desktop=1");
    await waitForMapReady(page);

    // 검색창이 왼쪽 위 카드 안에 있다.
    const search = await searchInput(page).boundingBox();
    expect(search).not.toBeNull();
    expect(search?.x).toBeGreaterThanOrEqual(DESKTOP_INSET_PX);
    expect((search?.x ?? 0) + (search?.width ?? 0)).toBeLessThanOrEqual(
      DESKTOP_INSET_PX + DESKTOP_PANEL_WIDTH_PX,
    );

    // 컨트롤은 화면 오른쪽 끝에서 16px 안쪽, 기본 하단 자리에 있다.
    const placement = await controlPlacementOf(page);
    expect(placement.right).toBe(VIEWPORT.width - DESKTOP_INSET_PX);
    expect(placement.bottom).toBe(BASE_BOTTOM_PX);
  });

  test("데스크톱에서는 로딩 중 컨트롤 자리표시도 화면 오른쪽 끝에 놓인다", async ({
    page,
  }) => {
    // 지도 SDK 응답을 붙잡아 로딩 상태에 머물게 한다. 끊으면 오류 화면으로 넘어가
    // 자리표시가 사라진다. 자리표시가 실제 컨트롤과 같은 자리에 있어야 SDK 가 붙을 때
    // 버튼이 오른쪽으로 튀지 않는다.
    let releaseSdk = () => {};
    const sdkHeld = new Promise<void>((resolve) => {
      releaseSdk = resolve;
    });
    await page.route("**/openapi.map.naver.com/**", async (route) => {
      await sdkHeld;
      await route.continue().catch(() => {});
    });
    // load 이벤트는 붙잡힌 SDK 를 기다리므로 문서가 그려진 시점까지만 기다린다.
    await page.goto("/?desktop=1", { waitUntil: "domcontentloaded" });

    const skeleton = page.locator("[data-map-controls-skeleton]");
    await expect(skeleton).toBeVisible();
    const right = await skeleton.evaluate((element) =>
      Math.round(
        Math.max(
          ...[...element.children].map(
            (child) => child.getBoundingClientRect().right,
          ),
        ),
      ),
    );

    expect(right).toBe(VIEWPORT.width - DESKTOP_INSET_PX);
    releaseSdk();
  });

  test("데스크톱에서는 상세 시트가 열려도 컨트롤이 따라 오르지 않는다", async ({
    page,
  }) => {
    await page.goto(`/lockers/${LOCKER_ID}?desktop=1`);
    await waitForMapReady(page);
    await expect(sheetSurface(page)).toBeVisible();

    const placement = await controlPlacementOf(page);
    expect(placement.right).toBe(VIEWPORT.width - DESKTOP_INSET_PX);
    expect(placement.bottom).toBe(BASE_BOTTOM_PX);
  });
});
