import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * 상세 시트가 떠 있을 때 지도 컨트롤이 시트 윗변을 따라가는지 본다.
 *
 * 시트가 열리는 순간, 스냅이 진행되는 동안, 안착한 뒤까지 위치가 어긋나지 않아야
 * 한다. 어긋나면 버튼이 시트 뒤로 들어가 눌리지 않는다. 브라우저에서 프레임 단위로
 * 재야 드러나는 문제라 jsdom 으로는 잡히지 않는다.
 */

const LOCKER_ID = 500;
const DETAIL_HALF_VISIBLE_HEIGHT = 191;
const SHEET_GAP_PX = 12;
const BASE_BOTTOM_PX = 70;
/** 상단 경계(120) + 스택 높이(96) */
const TOP_RESERVED_PX = 216;

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
      body: JSON.stringify(apiEnvelope(data)),
    });
  });
};

/** 프로덕션 빌드는 클래스명이 해시라 전용 앵커로 찾는다. */
const mapControlStack = (page: Page) => page.locator("[data-map-control-stack]");

const sheetSurface = (page: Page) => page.locator("[data-bottom-sheet-surface]");

/** 컨트롤과 무관한 신호로 지도 준비를 기다린다. */
const waitForMapReady = async (page: Page) => {
  await expect(page.locator('[data-map-state="ready"]')).toBeAttached();
};

const rectOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("요소를 찾지 못했다");

  return box;
};

/**
 * 시트가 마운트 슬라이드를 끝내고 목표 높이에 안착할 때까지 기다린다.
 *
 * toBeVisible 은 크기가 0 이 아니면 바로 통과하므로 올라오는 도중에도 참이다.
 * 그 시점에 높이를 재면 82·86 같은 중간값이 나온다.
 */
const expectSheetSettledAt = async (page: Page, visibleHeightPx: number) => {
  const viewportHeight = page.viewportSize()?.height ?? 0;

  await expect
    .poll(async () => {
      const box = await sheetSurface(page).boundingBox();
      return box ? Math.round(viewportHeight - box.y) : null;
    })
    .toBe(visibleHeightPx);
};

/** 컨트롤 아래끝이 시트 윗변보다 위에 있어야 눌린다. */
const expectControlClearsSheet = async (page: Page) => {
  const control = await rectOf(mapControlStack(page));
  const sheet = await rectOf(sheetSurface(page));

  expect(
    control.y + control.height,
    "컨트롤 아래끝이 시트 윗변을 넘어 시트 뒤에 깔렸다",
  ).toBeLessThanOrEqual(sheet.y + 1);
};

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

test.describe("상세 시트와 지도 컨트롤", () => {
  test("하프 시트 위로 밀어 올린다", async ({ page }) => {
    await page.goto(`/?locker=${LOCKER_ID}`);
    await waitForMapReady(page);
    await expect(mapControlStack(page)).toBeVisible();
    await expectSheetSettledAt(page, DETAIL_HALF_VISIBLE_HEIGHT);

    const bottom = await mapControlStack(page).evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).bottom),
    );

    expect(bottom).toBe(DETAIL_HALF_VISIBLE_HEIGHT + SHEET_GAP_PX);
    await expectControlClearsSheet(page);
  });

  test("시트를 끌어올리는 동안에도 시트 뒤로 들어가지 않는다", async ({
    page,
  }) => {
    await page.goto(`/?locker=${LOCKER_ID}`);
    await waitForMapReady(page);
    await expect(mapControlStack(page)).toBeVisible();
    // 올라오는 도중에 끌기 시작하면 시작 좌표가 시트를 벗어난다.
    await expectSheetSettledAt(page, DETAIL_HALF_VISIBLE_HEIGHT);

    const sheet = await rectOf(sheetSurface(page));
    const startX = sheet.x + sheet.width / 2;
    const startY = sheet.y + 8;

    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // 끌어올리는 도중 여러 지점에서 확인한다. 예전에는 단계가 바뀌기 전까지
    // 컨트롤이 제자리에 있어 손가락을 떼기 전에는 버튼이 눌리지 않았다.
    for (const y of [startY - 80, startY - 160, startY - 240]) {
      await page.mouse.move(startX, y, { steps: 8 });
      await expectControlClearsSheet(page);
    }

    await page.mouse.up();
  });

  test("놓을 자리가 없는 높이에서는 시트가 떠 있어도 숨긴다", async ({
    page,
  }) => {
    // 넉넉한 화면에서 시트와 컨트롤이 모두 뜬 것을 먼저 확인한다. 곧장 낮은
    // 화면으로 열고 "0개" 를 세면 아직 안 그려진 것과 구분되지 않는다.
    await page.goto(`/?locker=${LOCKER_ID}`);
    await expect(sheetSurface(page)).toBeVisible();
    await expect(mapControlStack(page)).toBeVisible();

    // 하프 시트(191) + 간격(12) + 예약 높이(216) = 419px 부터 놓을 수 있다.
    await page.setViewportSize({ width: 430, height: 418 });
    await expect(mapControlStack(page)).toHaveCount(0);
  });

  test("경계 높이에서는 상단 선에 맞춰 올린다", async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 419 });
    await page.goto(`/?locker=${LOCKER_ID}`);
    await waitForMapReady(page);
    await expect(mapControlStack(page)).toBeVisible();

    const bottom = await mapControlStack(page).evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).bottom),
    );

    // 419 - 216 = 203. 하프 시트를 피한 값(191 + 12)과 정확히 같다.
    expect(bottom).toBe(419 - TOP_RESERVED_PX);
    expect(bottom).toBe(DETAIL_HALF_VISIBLE_HEIGHT + SHEET_GAP_PX);
    await expectControlClearsSheet(page);
  });

  test("시트를 닫으면 기본 자리로 돌아온다", async ({ page }) => {
    await page.goto(`/?locker=${LOCKER_ID}`);
    await waitForMapReady(page);
    await expect(mapControlStack(page)).toBeVisible();

    await page.getByRole("button", { name: "닫기" }).click();
    await expect(sheetSurface(page)).toHaveCount(0);

    await expect
      .poll(async () =>
        mapControlStack(page).evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).bottom),
        ),
      )
      .toBe(BASE_BOTTOM_PX);
  });
});

/**
 * 시트가 사라지면 컨트롤도 따라 내려와야 한다.
 *
 * 단계(sheetMode)는 그대로인데 시트만 사라지는 상태가 있다. 검색 오버레이가
 * 덮을 때가 그렇다. 컨트롤 배치가 단계만 보던 시절에는 이때 컨트롤이 없는 시트
 * 윗변에 그대로 떠 있었고, 라이브 오프셋을 되돌리는 이펙트도 돌지 않아 화면
 * 한복판에 버튼만 남았다.
 */
test.describe("시트가 사라진 상태의 지도 컨트롤", () => {
  const bottomPxOf = (page: Page) =>
    mapControlStack(page).evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).bottom),
    );

  test("검색 오버레이가 시트를 덮으면 기본 자리로 돌아온다", async ({
    page,
  }) => {
    await page.goto(`/?locker=${LOCKER_ID}`);
    await waitForMapReady(page);
    await expectSheetSettledAt(page, DETAIL_HALF_VISIBLE_HEIGHT);
    expect(await bottomPxOf(page)).toBe(
      DETAIL_HALF_VISIBLE_HEIGHT + SHEET_GAP_PX,
    );

    await page.getByRole("button", { name: "검색어 입력" }).first().click();
    await expect(sheetSurface(page)).toHaveCount(0);

    await expect.poll(async () => bottomPxOf(page)).toBe(BASE_BOTTOM_PX);
  });

  test("검색 컨텍스트를 벗어나면 기본 자리로 돌아온다", async ({ page }) => {
    await page.goto("/?q=서울역");
    await waitForMapReady(page);
    await expect(sheetSurface(page)).toBeVisible();
    await expect(mapControlStack(page)).toBeVisible();

    await page.getByRole("button", { name: "홈으로 돌아가기" }).click();
    await expect(sheetSurface(page)).toHaveCount(0);

    await expect.poll(async () => bottomPxOf(page)).toBe(BASE_BOTTOM_PX);
  });
});
