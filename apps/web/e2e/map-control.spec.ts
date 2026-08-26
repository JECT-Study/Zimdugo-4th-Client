import { expect, type Page, test } from "@playwright/test";

/**
 * 지도 컨트롤(새로고침·내 위치)의 위치 규칙을 검증한다.
 *
 * 시트 위로 밀어 올리는 거리, 검색 바를 덮지 않도록 자르는 경계, 놓을 자리가
 * 없을 때 숨기는 판정은 모두 실제 레이아웃이 있어야 확인할 수 있다. jsdom 은
 * 레이아웃을 계산하지 않아 단위 테스트로는 잡히지 않는다.
 */

/** 컨트롤 스택이 지켜야 하는 값들. `-map-control-visibility.ts` 와 같은 근거다. */
const MAP_CONTROL = {
  /** 시트가 없을 때 놓이는 자리 */
  baseBottomPx: 70,
  /** 컨트롤과 시트 사이 간격 */
  sheetGapPx: 12,
  /** 스택 상단이 넘어서면 안 되는 선(검색 바 아래) */
  topLimitPx: 120,
  /** 버튼 두 개와 그 사이 간격을 합한 높이 */
  stackHeightPx: 42 * 2 + 12,
} as const;

/**
 * 백엔드를 타지 않는다.
 *
 * 클라이언트는 VITE_API_BASE_URL 이 없으면 `/api/...` 상대 경로로 부른다.
 * 프리뷰 서버에는 프록시가 없으므로 여기서 전부 가로챈다. 이 스펙이 보는 것은
 * 레이아웃이지 데이터가 아니다.
 */
const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const body = url.includes("/pins")
      ? { items: [] }
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
        data: body,
      }),
    });
  });
};

/** 지도 컨트롤 스택. 프로덕션 빌드는 클래스명이 해시라 전용 앵커로 찾는다. */
const mapControlStack = (page: Page) => page.locator("[data-map-control-stack]");

/**
 * 지도 SDK 가 붙고 부트스트랩이 끝날 때까지 기다린다.
 *
 * 컨트롤 자체를 신호로 쓰면 안 된다. 아직 지도가 준비되지 않아 없는 것인지,
 * 배치 판정이 잘못돼 숨겨진 것인지 구분하지 못한다. 컨트롤이 "없어야 한다" 를
 * 단언하는 곳에서는 특히 그렇다.
 */
const waitForMapReady = async (page: Page) => {
  await expect(page.locator('[data-map-state="ready"]')).toBeAttached();
};

const bottomPxOf = async (page: Page) => {
  const value = await mapControlStack(page).evaluate(
    (element) => getComputedStyle(element).bottom,
  );

  return Number.parseFloat(value);
};

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

test.describe("지도 컨트롤 위치", () => {
  test("시트가 없으면 기본 자리에 놓인다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);

    expect(await bottomPxOf(page)).toBe(MAP_CONTROL.baseBottomPx);
  });

  test("스택을 놓을 자리가 없는 화면에서는 숨긴다", async ({ page }) => {
    // 상단 경계(120) + 스택(96) + 기본 하단(70) = 286px 이 최소 높이다.
    await page.setViewportSize({ width: 430, height: 260 });
    await page.goto("/");

    // 지도가 준비된 뒤에 확인해야 한다. 로딩 중에는 컨트롤이 없는 게 당연해서
    // 바로 세면 배치 판정이 잘못돼도 통과한다.
    await waitForMapReady(page);
    await expect(mapControlStack(page)).toHaveCount(0);
  });

  test("경계 높이에서 표시 여부가 갈린다", async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 286 });
    await page.goto("/");
    await waitForMapReady(page);

    // 286px 이면 딱 놓을 수 있다. 스택 상단이 경계선에 정확히 닿는다.
    const box = await mapControlStack(page).boundingBox();
    expect(box?.y).toBeCloseTo(MAP_CONTROL.topLimitPx, 0);
  });
});
