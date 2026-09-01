import { expect, type Page, test } from "@playwright/test";

/**
 * 검색으로 들어가는 길을 끝까지 밟는다.
 *
 * 검색은 홈에서 결과 목록·상세로 갈라지는 입구인데 e2e 가 한 줄도 없었다. 경로
 * 라우트 전환(#215)의 수용 기준 — 검색을 끝낸 뒤 뒤로가기가 어디로 가는가 — 은
 * 대부분 이 길 위에서만 확인된다. 전환보다 먼저 뚫어 둔다.
 *
 * #215 는 원인을 "검색 입력이 readonly 라 합성 클릭으로 열리지 않는다" 로 적었는데
 * 그렇지 않았다. 막고 있던 것은 위치 권한 안내 팝업이다. 아래 test.use 참고.
 */

const LOCKER_ID = 500;
const KEYWORD = "강남역";

const suggestItemRaw = {
  type: "LOCKER",
  placeId: 900,
  placeName: "강남역",
  lockerId: LOCKER_ID,
  lockerName: "강남역 4번 출구 보관함",
  roadAddress: "서울 강남구 강남대로 지하 396",
  lockerType: "SUBWAY",
  distanceMeters: 120,
  updatedAt: "2026-08-01T00:00:00",
};

const searchItemRaw = {
  type: "LOCKER",
  placeId: 900,
  placeName: "강남역",
  lockerId: LOCKER_ID,
  lockerName: "강남역 4번 출구 보관함",
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

const boundsRaw = {
  swLat: 37.49,
  swLng: 127.01,
  neLat: 37.51,
  neLng: 127.04,
};

const lockerDetailRaw = {
  lockerId: LOCKER_ID,
  lockerName: "강남역 4번 출구 보관함",
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

/**
 * 백엔드를 타지 않는다. 이 스펙이 보는 것은 화면이 갈리는 길이지 데이터가 아니다.
 */
const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const lockerIdMatch = url.match(/\/lockers\/(\d+)/);

    const data = url.includes("/lockers/suggest")
      ? { count: 1, items: [suggestItemRaw] }
      : url.includes("/lockers/search")
        ? { count: 1, bounds: boundsRaw, items: [searchItemRaw] }
        : url.includes("/lockers/pins")
          ? { items: [] }
          : lockerIdMatch
            ? lockerDetailRaw
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
 * 홈 검색 바. 오버레이의 입력과 aria-label 이 같아서 readonly 여부로 가른다.
 * 홈 검색 바는 누르기만 하는 자리라 readonly 이고, 타이핑은 오버레이가 받는다.
 */
const homeSearchBar = (page: Page) =>
  page.locator('input[aria-label="검색어 입력"][readonly]');

const overlaySearchInput = (page: Page) =>
  page.locator('input[aria-label="검색어 입력"]:not([readonly])');

const queryParam = (page: Page, name: string) =>
  page.evaluate(
    (key) => new URLSearchParams(location.search).get(key),
    name,
  );

const historyLength = (page: Page) => page.evaluate(() => history.length);

const openSearchOverlay = async (page: Page) => {
  await homeSearchBar(page).click();
  await expect(overlaySearchInput(page)).toBeVisible();
};

/** 오버레이에 검색어를 넣고 제출해 결과 목록까지 간다. */
const submitSearch = async (page: Page, keyword: string) => {
  await overlaySearchInput(page).fill(keyword);
  await overlaySearchInput(page).press("Enter");
  await expect.poll(() => queryParam(page, "q")).toBe(keyword);
};

/**
 * 위치 권한을 준 상태로 연다.
 *
 * 권한이 없으면 앱이 화면 전체를 덮는 안내 팝업을 띄운다(z-index 1100). 그 아래의
 * 검색 바는 눌리지 않아 검색 경로를 밟기 전에 막힌다. #215 가 readonly 탓으로 적은
 * 증상의 실제 원인이다.
 */
test.use({
  permissions: ["geolocation"],
  geolocation: { latitude: 37.4979, longitude: 127.0276 },
});

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

test.describe("검색 경로", () => {
  test("홈 검색 바를 누르면 검색 오버레이가 열린다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);

    await expect(homeSearchBar(page)).toBeVisible();
    await openSearchOverlay(page);
  });

  test("검색어를 넣으면 자동완성이 뜬다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);

    await overlaySearchInput(page).fill(KEYWORD);

    await expect(
      page.getByText(suggestItemRaw.lockerName).first(),
    ).toBeVisible();
  });

  test("검색을 제출하면 결과 목록이 뜨고 주소에 q 가 남는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);

    await expect(overlaySearchInput(page)).toBeHidden();
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
  });

  test("결과 항목을 누르면 상세가 열린다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);

    await page.getByText(searchItemRaw.lockerName).first().click();

    await expect.poll(() => queryParam(page, "locker")).not.toBeNull();
  });

  /**
   * #215 의 수용 기준이 서는 자리.
   *
   * 지금은 검색 진입이 replace 라 검색을 끝내고 뒤로 가면 홈이 아니라 직전 항목으로
   * 간다. 전환 뒤에는 `/` ▸ `/search?q=…` ▸ `/lockers/…` 가 각자 한 칸을 차지해야
   * 한다. 지금 값을 고정해 두면 전환에서 무엇이 달라지는지 이 스펙이 말해 준다.
   */
  test("검색을 여닫아도 히스토리가 쌓이지 않는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);

    const baseline = await historyLength(page);

    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);

    expect(
      await historyLength(page),
      "검색 진입이 칸을 만들면 뒤로가기를 그만큼 더 눌러야 한다",
    ).toBe(baseline);
  });

  /**
   * 지금 상태를 있는 그대로 박아 둔다. #215 가 바꾸려는 자리다.
   *
   * 검색 진입이 replace 라 홈은 자기 칸을 갖지 못한다. 그래서 검색을 끝내고 뒤로
   * 가면 홈이 아니라 홈보다 앞에 있던 화면으로 간다. 전환 뒤에는 `/` 로 돌아와야
   * 하고, 그때 이 테스트가 깨지면서 무엇이 달라졌는지 알려 준다.
   *
   * 홈 앞에 칸을 하나 만들어 두고 시작한다. 홈에서 바로 열면 뒤로가기가 문서 밖
   * (about:blank)으로 나가 버려, "홈으로 돌아오지 못했다" 를 주소로 가릴 수 없다.
   */
  test("검색을 끝내고 뒤로 가면 홈이 아니라 그 전 화면으로 간다", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: /테마 설정/ })).toBeVisible();

    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);

    await page.goBack();

    await expect.poll(() => new URL(page.url()).pathname).toBe("/settings");
  });
});
