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

const KEYWORD = "강남역";

const searchItemRaw = {
  type: "LOCKER",
  placeId: 900,
  placeName: "강남역",
  lockerId: LOCKER_ID,
  lockerName: "결과 목록 강남역 보관함",
  roadAddress: "서울 강남구 강남대로 지하 396",
  lockerType: "SUBWAY",
  minPrice: 2000,
  latitude: 37.4979,
  longitude: 127.0276,
  distanceMeters: 120,
  updatedAt: "2026-08-01T00:00:00",
  isFavorite: false,
  lockers: [],
};

const boundsRaw = { swLat: 37.49, swLng: 127.01, neLat: 37.51, neLng: 127.04 };

/** 결과 목록 항목과 출처가 갈리도록 이름을 다르게 둔다. */
const suggestItemRaw = {
  type: "LOCKER",
  placeId: 900,
  placeName: "강남역",
  lockerId: LOCKER_ID,
  lockerName: "자동완성 강남역 보관함",
  roadAddress: "서울 강남구 강남대로 지하 396",
  lockerType: "SUBWAY",
  distanceMeters: 120,
  updatedAt: "2026-08-01T00:00:00",
};

/** 상세와 같은 자리의 보관함 핀 하나. 핀 카드 흐름에서 누른다. */
const lockerPinRaw = {
  pinType: "LOCKER",
  lockerId: LOCKER_ID,
  placeId: null,
  latitude: 37.4979,
  longitude: 127.0276,
  isFavorite: false,
  lockerCount: null,
  pinCount: null,
  bounds: null,
  markerStatus: "DEFAULT",
};

const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const data = url.includes("/pins")
      ? { items: [lockerPinRaw] }
      : url.includes("/lockers/search")
        ? { count: 1, bounds: boundsRaw, items: [searchItemRaw] }
        : url.includes(`/lockers/${LOCKER_ID}`)
          ? lockerDetailRaw
          : url.includes("/suggest")
            ? { count: 1, items: [suggestItemRaw] }
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
const desktopListPanel = (page: Page) =>
  page.locator("[data-desktop-list-panel]");
const desktopFilterPanel = (page: Page) =>
  page.locator("[data-desktop-filter-panel]");
const desktopDetailPanel = (page: Page) =>
  page.locator("[data-desktop-detail-panel]");
/** 검색 결과 목록의 필터 칩. 이름은 시각적으로 숨긴 글자에서 온다. */
const searchFilterChip = (page: Page) =>
  page.getByRole("button", { name: "장소 유형", exact: true });
const searchOverlay = (page: Page) => page.locator("[data-search-overlay]");
const lockerPinCard = (page: Page) => page.locator("[data-locker-pin-card]");

/**
 * 지도 핀을 누른다. 핀은 지도 SDK 가 얹은 층 아래에 깔려 Playwright 의 클릭이 닿지
 * 않으므로, SDK 가 듣는 이벤트를 핀 요소에 직접 보낸다(home-history 와 같은 방식).
 */
const pressFirstMarker = async (page: Page) => {
  await expect
    .poll(() => page.locator(".map-marker-offset-wrapper").count())
    .toBeGreaterThan(0);
  await page.evaluate(() => {
    const marker = document.querySelector(".map-marker-offset-wrapper");
    if (!marker) throw new Error("핀이 없다");
    const box = marker.getBoundingClientRect();
    const init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: box.x + box.width / 2,
      clientY: box.y + box.height / 2,
    };
    const pointer = { ...init, pointerType: "mouse", isPrimary: true };
    marker.dispatchEvent(new PointerEvent("pointerdown", pointer));
    marker.dispatchEvent(new MouseEvent("mousedown", init));
    marker.dispatchEvent(new PointerEvent("pointerup", pointer));
    marker.dispatchEvent(new MouseEvent("mouseup", init));
    marker.dispatchEvent(new MouseEvent("click", init));
  });
};
/** 검색 카드의 입력창은 누르기만 하는 자리라 readonly, 타이핑은 오버레이가 받는다. */
const homeSearchInput = (page: Page) =>
  page.locator('input[aria-label="검색어 입력"][readonly]');
const overlayInput = (page: Page) =>
  searchOverlay(page).locator('input[aria-label="검색어 입력"]');

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

  test("데스크톱에서는 상세가 열려도 컨트롤이 따라 오르지 않는다", async ({
    page,
  }) => {
    await page.goto(`/lockers/${LOCKER_ID}?desktop=1`);
    await waitForMapReady(page);
    await expect(desktopDetailPanel(page)).toBeVisible();

    const placement = await controlPlacementOf(page);
    expect(placement.right).toBe(VIEWPORT.width - DESKTOP_INSET_PX);
    expect(placement.bottom).toBe(BASE_BOTTOM_PX);
  });

  test("데스크톱 검색 결과는 바텀시트가 아니라 검색 카드 아래 패널에 열린다", async ({
    page,
  }) => {
    await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}&desktop=1`);
    await waitForMapReady(page);

    const panel = desktopListPanel(page);
    await expect(panel).toBeVisible();
    await expect(panel.getByText("결과 목록 강남역 보관함")).toBeVisible();
    await expect(sheetSurface(page)).toHaveCount(0);

    // 검색 카드와 같은 자리·폭으로 화면 아래(여백 16)까지 이어진다.
    const box = await panel.boundingBox();
    expect(box?.x).toBe(DESKTOP_INSET_PX);
    expect(box?.y).toBe(DESKTOP_INSET_PX);
    expect(box?.width).toBe(DESKTOP_PANEL_WIDTH_PX);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(
      VIEWPORT.height - DESKTOP_INSET_PX,
    );

    // 검색창은 패널 위층 카드 안에서 그대로 보이고 눌린다.
    const search = await searchInput(page).boundingBox();
    expect(search?.y).toBeLessThan((box?.y ?? 0) + 160);
  });

  test("플래그가 꺼져 있으면 검색 결과는 기존 바텀시트로 열린다", async ({
    page,
  }) => {
    await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}`);
    await waitForMapReady(page);

    await expect(sheetSurface(page)).toBeVisible();
    await expect(desktopListPanel(page)).toHaveCount(0);
  });

  test.describe("보관함 상세", () => {
    // 권한이 없으면 위치 안내 팝업이 화면 전체를 덮어 목록 행이 눌리지 않는다.
    test.use({
      permissions: ["geolocation"],
      geolocation: { latitude: 37.4979, longitude: 127.0276 },
    });

    test("링크로 연 데스크톱 상세는 바텀시트가 아니라 검색 카드 아래 패널에 열린다", async ({
      page,
    }) => {
      await page.goto(`/lockers/${LOCKER_ID}?desktop=1`);
      await waitForMapReady(page);

      const panel = desktopDetailPanel(page);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute(
        "data-desktop-detail-panel",
        "attached",
      );
      await expect(
        panel.getByRole("heading", { name: "강남역 4번 출구 물품보관함" }),
      ).toBeVisible();
      await expect(sheetSurface(page)).toHaveCount(0);
      await expect(desktopListPanel(page)).toHaveCount(0);

      const box = await panel.boundingBox();
      expect(box?.x).toBe(DESKTOP_INSET_PX);
      expect(box?.y).toBe(DESKTOP_INSET_PX);
      expect(box?.width).toBe(DESKTOP_PANEL_WIDTH_PX);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(
        VIEWPORT.height - DESKTOP_INSET_PX,
      );

      // 동작은 요약 아래 칩 줄이다. 더보기 메뉴와 보관 타이머는 두지 않는다.
      for (const name of ["길찾기", "공유하기", "신고하기"]) {
        await expect(panel.getByRole("button", { name })).toBeVisible();
      }
      await expect(
        panel.getByRole("button", { name: "더보기 메뉴 열기" }),
      ).toHaveCount(0);
      await expect(
        panel.getByRole("button", { name: "보관 타이머 설정" }),
      ).toHaveCount(0);
    });

    test("검색 결과에서 연 데스크톱 상세는 목록을 남긴 채 그 오른쪽 카드에 열린다", async ({
      page,
    }) => {
      await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}&desktop=1`);
      await waitForMapReady(page);
      await desktopListPanel(page).getByText("결과 목록 강남역 보관함").click();

      const panel = desktopDetailPanel(page);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute("data-desktop-detail-panel", "beside");
      // 상세 응답 이름이 보여야 목록 항목이 아니라 상세가 그려진 것이다.
      await expect(
        panel.getByRole("heading", { name: "강남역 4번 출구 물품보관함" }),
      ).toBeVisible();
      await expect(desktopListPanel(page)).toBeVisible();
      await expect(sheetSurface(page)).toHaveCount(0);

      // 목록 카드(16 + 400) 옆으로 카드 간격 12 를 띄운다.
      const box = await panel.boundingBox();
      expect(box?.x).toBe(DESKTOP_INSET_PX + DESKTOP_PANEL_WIDTH_PX + 12);
      expect(box?.y).toBe(DESKTOP_INSET_PX);
      expect(box?.width).toBe(DESKTOP_PANEL_WIDTH_PX);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(
        VIEWPORT.height - DESKTOP_INSET_PX,
      );

      // 닫으면 상세 카드만 걷히고 목록은 제자리에 남는다.
      await panel.getByRole("button", { name: "닫기", exact: true }).click();
      await expect(desktopDetailPanel(page)).toHaveCount(0);
      await expect(
        desktopListPanel(page).getByText("결과 목록 강남역 보관함"),
      ).toBeVisible();
    });

    test("상세 옆 목록에서 필터를 열면 상세를 닫고 목록 위에 필터를 연다", async ({
      page,
    }) => {
      await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}&desktop=1`);
      await waitForMapReady(page);
      await desktopListPanel(page).getByText("결과 목록 강남역 보관함").click();
      await expect(desktopDetailPanel(page)).toBeVisible();
      await expect(page).toHaveURL(/\/lockers\//);

      await searchFilterChip(page).click();

      await expect(desktopFilterPanel(page)).toBeVisible();
      await expect(desktopDetailPanel(page)).toHaveCount(0);
      await expect(page).toHaveURL(/\/search\?/);

      // 뒤로가기는 필터만 닫고 상세 없는 목록 주소에 남는다.
      await page.goBack();
      await expect(desktopFilterPanel(page)).toHaveCount(0);
      await expect(
        desktopListPanel(page).getByText("결과 목록 강남역 보관함"),
      ).toBeVisible();
      await expect(desktopDetailPanel(page)).toHaveCount(0);
      await expect(page).toHaveURL(/\/search\?/);
    });
  });

  test.describe("핀 위 요약 카드", () => {
    test.use({
      permissions: ["geolocation"],
      geolocation: { latitude: 37.4979, longitude: 127.0276 },
    });

    test("데스크톱에서 지도 핀을 누르면 상세 대신 핀 위에 요약 카드를 띄운다", async ({
      page,
    }) => {
      await page.goto("/?desktop=1");
      await waitForMapReady(page);
      await pressFirstMarker(page);

      const card = lockerPinCard(page);
      await expect(card).toBeVisible();
      // 상세 응답의 이름이 보여야 핀 자리표시가 아니라 받아 온 상세를 그린 것이다.
      await expect(
        card.getByRole("heading", { name: "강남역 4번 출구 물품보관함" }),
      ).toBeVisible();
      await expect(
        card.getByRole("button", { name: "자세히 보기" }),
      ).toBeVisible();
      await expect(desktopDetailPanel(page)).toHaveCount(0);
      await expect(page).not.toHaveURL(/\/lockers\//);

      // Esc 로 닫는다.
      await page.keyboard.press("Escape");
      await expect(card).toHaveCount(0);
    });

    test("자세히 보기를 누르면 카드를 닫고 상세 패널을 연다", async ({ page }) => {
      await page.goto("/?desktop=1");
      await waitForMapReady(page);
      await pressFirstMarker(page);
      await lockerPinCard(page)
        .getByRole("button", { name: "자세히 보기" })
        .click();

      await expect(desktopDetailPanel(page)).toBeVisible();
      await expect(
        desktopDetailPanel(page).getByRole("heading", {
          name: "강남역 4번 출구 물품보관함",
        }),
      ).toBeVisible();
      await expect(lockerPinCard(page)).toHaveCount(0);
      await expect(page).toHaveURL(/\/lockers\/500/);
    });

    test("상세를 받지 못하면 카드가 자리표시에 머물지 않고 오류와 다시 시도를 보여 준다", async ({
      page,
    }) => {
      // 상세 요청만 실패시킨다. 나중에 건 경로가 먼저 응답한다.
      let failDetail = true;
      await page.route(`**/api/v1/lockers/${LOCKER_ID}?**`, async (route) => {
        if (!failDetail) return route.fallback();
        await route.fulfill({ status: 500, body: "{}" });
      });
      await page.goto("/?desktop=1");
      await waitForMapReady(page);
      await pressFirstMarker(page);

      const card = lockerPinCard(page);
      await expect(card.getByText("정보를 불러오지 못했어요")).toBeVisible();
      await expect(card.getByRole("button", { name: "길찾기" })).toBeDisabled();
      await expect(
        card.getByRole("button", { name: "자세히 보기" }),
      ).toBeEnabled();

      failDetail = false;
      await card.getByRole("button", { name: "다시 시도" }).click();
      await expect(
        card.getByRole("heading", { name: "강남역 4번 출구 물품보관함" }),
      ).toBeVisible();
    });

    test("카드에서 연 길찾기 창은 뒤로가기로 닫히고 앞으로가기로 다시 열린다", async ({
      page,
    }) => {
      await page.goto("/?desktop=1");
      await waitForMapReady(page);
      await pressFirstMarker(page);
      const card = lockerPinCard(page);
      await expect(
        card.getByRole("heading", { name: "강남역 4번 출구 물품보관함" }),
      ).toBeVisible();

      await card.getByRole("button", { name: "길찾기" }).click();
      const popup = page.getByRole("dialog", { name: "길찾기 플랫폼 선택" });
      await expect(popup).toBeVisible();

      await page.goBack();
      await expect(popup).toHaveCount(0);

      await page.goForward();
      await expect(popup).toBeVisible();
      // 카드는 주소를 바꾸지 않는다. 앞으로가기로도 상세 화면이 되지 않는다.
      await expect(page).not.toHaveURL(/\/lockers\//);
    });

    test("플래그가 꺼져 있으면 핀을 누를 때 카드 없이 상세를 연다", async ({
      page,
    }) => {
      await page.goto("/");
      await waitForMapReady(page);
      await pressFirstMarker(page);

      await expect(sheetSurface(page)).toBeVisible();
      await expect(lockerPinCard(page)).toHaveCount(0);
    });
  });

  test.describe("검색 오버레이", () => {
    // 권한이 없으면 위치 안내 팝업이 화면 전체를 덮어 검색 카드가 눌리지 않는다.
    test.use({
      permissions: ["geolocation"],
      geolocation: { latitude: 37.4979, longitude: 127.0276 },
    });

    test("데스크톱 검색 오버레이는 화면을 덮지 않고 검색 카드 자리의 패널로 열린다", async ({
      page,
    }) => {
      await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}&desktop=1`);
      await waitForMapReady(page);

      // 결과 화면의 검색 카드에는 되돌아가기 버튼이 있다. 오버레이 입력창이 이 자리에
      // 그대로 와야 열 때 튀지 않는다.
      await expect(desktopListPanel(page)).toBeVisible();
      const cardInput = await homeSearchInput(page).boundingBox();

      await homeSearchInput(page).click();
      await expect(overlayInput(page)).toBeVisible();
      await overlayInput(page).fill("강남");
      await expect(
        searchOverlay(page).getByText("자동완성 강남역 보관함"),
      ).toBeVisible();

      const box = await searchOverlay(page).boundingBox();
      expect(box?.x).toBe(DESKTOP_INSET_PX);
      expect(box?.y).toBe(DESKTOP_INSET_PX);
      expect(box?.width).toBe(DESKTOP_PANEL_WIDTH_PX);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(
        VIEWPORT.height - DESKTOP_INSET_PX,
      );

      const input = await overlayInput(page).boundingBox();
      expect(input?.x).toBe(cardInput?.x);
      expect(input?.y).toBe(cardInput?.y);

      // 로고 줄은 헤더가 오버레이 위에서 그대로 그리고, 오른쪽 지도는 가리지 않는다.
      const topAt = (x: number, y: number) =>
        page.evaluate(
          ([px, py]) => {
            const element = document.elementFromPoint(px, py);
            if (element?.closest("header")) return "header";
            if (element?.closest("[data-search-overlay]")) return "overlay";
            return "other";
          },
          [x, y] as const,
        );
      expect(await topAt(DESKTOP_INSET_PX + 30, DESKTOP_INSET_PX + 36)).toBe(
        "header",
      );
      expect(await topAt(VIEWPORT.width / 2, VIEWPORT.height / 2)).toBe(
        "other",
      );
    });

    test("플래그가 꺼져 있으면 검색 오버레이는 화면 전체를 덮는다", async ({
      page,
    }) => {
      await page.goto("/");
      await waitForMapReady(page);

      await homeSearchInput(page).click();
      await expect(overlayInput(page)).toBeVisible();

      const box = await searchOverlay(page).boundingBox();
      expect(box?.y).toBe(0);
      expect(box?.height).toBe(VIEWPORT.height);
    });
  });

  test.describe("필터", () => {
    // 권한이 없으면 위치 안내 팝업이 화면 전체를 덮어 필터 칩이 눌리지 않는다.
    test.use({
      permissions: ["geolocation"],
      geolocation: { latitude: 37.4979, longitude: 127.0276 },
    });

    test("데스크톱 필터는 바텀시트가 아니라 결과 패널 자리의 패널로 열린다", async ({
      page,
    }) => {
      await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}&desktop=1`);
      await waitForMapReady(page);
      await expect(desktopListPanel(page)).toBeVisible();

      await searchFilterChip(page).click();

      const panel = desktopFilterPanel(page);
      await expect(panel).toBeVisible();
      await expect(
        panel.getByRole("heading", { name: "필터", exact: true }),
      ).toBeVisible();
      await expect(
        panel.getByRole("button", { name: "보관함 보기" }),
      ).toBeVisible();
      await expect(sheetSurface(page)).toHaveCount(0);
      await expect(desktopListPanel(page)).toHaveCount(0);

      const box = await panel.boundingBox();
      expect(box?.x).toBe(DESKTOP_INSET_PX);
      expect(box?.y).toBe(DESKTOP_INSET_PX);
      expect(box?.width).toBe(DESKTOP_PANEL_WIDTH_PX);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(
        VIEWPORT.height - DESKTOP_INSET_PX,
      );

      // 제목·구역 제목 글자와 하단 버튼이 검색 카드와 같은 왼쪽 선(패널 + 20)에서
      // 시작한다. 글자는 상자 여백이 아니라 글자가 실제로 그려진 자리를 잰다.
      const textLeftOf = (locator: ReturnType<Page["locator"]>) =>
        locator.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return Math.round(range.getBoundingClientRect().left);
        });
      const contentLeft = DESKTOP_INSET_PX + 20;
      expect(
        await textLeftOf(
          panel.getByRole("heading", { name: "필터", exact: true }),
        ),
      ).toBe(contentLeft);
      expect(await textLeftOf(panel.getByText("사이즈", { exact: true }))).toBe(
        contentLeft,
      );
      expect(
        Math.round(
          (await panel.getByRole("button", { name: "초기화" }).boundingBox())
            ?.x ?? -1,
        ),
      ).toBe(contentLeft);

      // 닫기는 검색 카드의 되돌아가기 버튼이 맡는다. 패널에는 따로 두지 않는다.
      await expect(panel.getByRole("button", { name: "필터 닫기" })).toHaveCount(
        0,
      );
    });

    test("데스크톱 필터를 검색 카드의 되돌아가기 버튼으로 닫으면 고른 값을 적용하지 않고 결과로 돌아간다", async ({
      page,
    }) => {
      await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}&desktop=1`);
      await waitForMapReady(page);

      await searchFilterChip(page).click();
      const subwayChip = desktopFilterPanel(page).getByRole("button", {
        name: "지하철역",
        exact: true,
      });
      await subwayChip.click();
      await expect(subwayChip).toHaveAttribute("aria-pressed", "true");

      await page.getByRole("button", { name: "홈으로 돌아가기" }).click();

      await expect(desktopFilterPanel(page)).toHaveCount(0);
      await expect(desktopListPanel(page)).toBeVisible();
      await expect(
        desktopListPanel(page).getByText("결과 목록 강남역 보관함"),
      ).toBeVisible();

      // 다시 열면 적용하지 않은 선택은 남아 있지 않다.
      await searchFilterChip(page).click();
      await expect(
        desktopFilterPanel(page).getByRole("button", {
          name: "지하철역",
          exact: true,
        }),
      ).toHaveAttribute("aria-pressed", "false");
    });
  });
});
