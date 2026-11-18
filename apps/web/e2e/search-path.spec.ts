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

/**
 * 자동완성과 결과 목록이 서로 다른 이름을 낸다.
 *
 * 같은 이름을 쓰면 "자동완성이 떴다" 와 "결과 목록이 떴다" 를 텍스트로 가를 수 없어,
 * 한쪽이 고장 나도 다른 쪽 단언이 통과한다.
 */
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

const boundsRaw = {
  swLat: 37.49,
  swLng: 127.01,
  neLat: 37.51,
  neLng: 127.04,
};

const lockerDetailRaw = {
  lockerId: LOCKER_ID,
  lockerName: "상세 강남역 보관함",
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

/** 주소가 가리키는 보관함 상세. 상세는 `/lockers/<slug>` 경로로 나타난다. */
const lockerPath = (page: Page) =>
  page.evaluate(
    () => location.pathname.match(/^\/lockers\/([^/]+)$/)?.[1] ?? null,
  );

/**
 * 지금 히스토리 칸의 위치. 앞에서부터 몇 번째 칸인지다.
 *
 * `history.length` 는 앞으로가기로 갈 칸까지 세서, 뒤로 돌아온 뒤에도 줄지 않는다.
 * 라우터가 칸마다 적는 위치를 읽는다.
 */
const historyIndex = (page: Page) =>
  page.evaluate(
    () => (history.state as { __TSR_index?: number } | null)?.__TSR_index ?? 0,
  );

/** 검색 결과 목록의 필터 칩. 이름은 시각적으로 숨긴 글자에서 온다. */
const searchFilterChip = (page: Page) =>
  page.getByRole("button", { name: "장소 유형", exact: true });

/** 필터 시트의 적용 버튼. 필터 시트에만 있다. */
const filterApplyButton = (page: Page) =>
  page.getByRole("button", { name: "보관함 보기" });

/** 검색창 왼쪽의 앱 안 되돌아가기 버튼. */
const searchBarBackButton = (page: Page) =>
  page.getByRole("button", { name: "홈으로 돌아가기" });

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
  /*
   * 화면 문구("길찾기", "홈으로 돌아가기")로 요소를 찾으므로 언어를 고정한다. 기기
   * 기본값(영어)이면 서버가 `/search` 같은 경로를 `/en/…` 으로 보낸다. 홈(`/`)은
   * 프리렌더된 한국어 파일이 바로 응답해 이 판정을 거치지 않는다.
   */
  locale: "ko-KR",
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

  /**
   * 주소만 보면 모자란다.
   *
   * openLockerDetailById 는 상세 주소를 먼저 붙이고 상세 상태는 다음
   * 이벤트 루프에서 세운다. 그래서 시트가 뜨지 않거나 상세 데이터가 안 와도
   * 주소 단언은 통과한다. 상세에만 있는 값까지 봐야 길이 이어진 것이다.
   */
  test("결과 항목을 누르면 상세가 열린다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);

    await page.getByText(searchItemRaw.lockerName).first().click();

    await expect.poll(() => lockerPath(page)).not.toBeNull();

    // 상세 시트가 실제로 떴는지. 길찾기는 상세에만 있는 동작이다.
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();

    // 상세 API 의 값이 화면까지 닿았는지. 목록에는 없는 필드다.
    await expect(page.getByText(lockerDetailRaw.detailInfo)).toBeVisible();
  });

  /**
   * #215 의 수용 기준이 서는 자리.
   *
   * 화면 하나가 히스토리 한 칸이다. 홈 ▸ 검색 결과 ▸ 상세가 각자 칸을 차지하므로,
   * 뒤로가기는 들어온 순서를 그대로 되짚고 홈에서 한 번 더 누르면 앱을 떠난다.
   *
   * 홈 앞에 칸을 하나 만들어 두고 시작한다. 홈에서 바로 열면 마지막 뒤로가기가 문서
   * 밖(about:blank)으로 나가, "앱을 떠났다" 를 주소로 가릴 수 없다.
   */
  test("검색 결과와 상세에서 뒤로 가면 들어온 순서대로 되짚고 홈 다음에 앱을 떠난다", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: /테마 설정/ })).toBeVisible();

    await page.goto("/");
    await waitForMapReady(page);
    const homeIndex = await historyIndex(page);

    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    expect(new URL(page.url()).pathname).toBe("/search");
    expect(await historyIndex(page), "검색 결과는 홈 위에 칸을 만든다").toBe(
      homeIndex + 1,
    );

    await page.getByText(searchItemRaw.lockerName).first().click();
    await expect.poll(() => lockerPath(page)).not.toBeNull();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();
    expect(await historyIndex(page), "상세는 검색 결과 위에 칸을 만든다").toBe(
      homeIndex + 2,
    );

    await page.goBack();
    await expect.poll(() => lockerPath(page)).toBeNull();
    await expect.poll(() => queryParam(page, "q")).toBe(KEYWORD);
    // 검색 결과 시트가 다시 그려졌는지. 목록 항목은 결과 화면에만 있다.
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeHidden();

    await page.goBack();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(page.getByText(searchItemRaw.lockerName)).toHaveCount(0);

    await page.goBack();
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/\/settings$/);
  });

  /**
   * 앱 안 되돌아가기 버튼도 기기 뒤로가기와 같은 결과여야 한다. 히스토리를 되감지 않고
   * 새 칸을 만들면, 그 뒤 기기 뒤로가기가 방금 닫은 화면을 다시 연다(#214).
   */
  test("앱 안 되돌아가기는 칸을 만들지 않고 히스토리를 되감는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    const homeIndex = await historyIndex(page);

    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await page.getByText(searchItemRaw.lockerName).first().click();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();

    await searchBarBackButton(page).click();
    await expect.poll(() => lockerPath(page)).toBeNull();
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
    expect(await historyIndex(page)).toBe(homeIndex + 1);

    await searchBarBackButton(page).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    expect(
      await historyIndex(page),
      "검색을 끝내면 검색이 쌓은 칸을 모두 되감아 홈 칸으로 돌아온다",
    ).toBe(homeIndex);
  });

  /**
   * 검색을 끝내면 검색이 쌓은 칸을 되감고, 닿은 첫 칸이 홈이 아니면 홈으로 바꾼다.
   *
   * 첫 칸과 떠나기 직전 칸이 같은 주소일 수 있다. 검색 결과 주소로 바로 들어와 상세를
   * 연 뒤 같은 검색어로 다시 검색하면, 되감아 닿은 첫 칸도 같은 검색 결과다. 화면이
   * 바뀐 것만 보고 홈으로 바꾸면 이 경우를 놓쳐 검색 결과에 남는다.
   */
  test("같은 주소의 첫 칸으로 되감겨도 검색을 끝내면 홈이 된다", async ({
    page,
  }) => {
    await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}`);
    await waitForMapReady(page);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();

    await page.getByText(searchItemRaw.lockerName).first().click();
    await expect.poll(() => lockerPath(page)).not.toBeNull();

    await openSearchOverlay(page);
    await overlaySearchInput(page).fill(KEYWORD);
    await overlaySearchInput(page).press("Enter");
    await expect.poll(() => lockerPath(page)).toBeNull();
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();

    await searchBarBackButton(page).click();

    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(page.getByText(searchItemRaw.lockerName)).toHaveCount(0);
  });

  /**
   * 필터는 주소에 두지 않는다. 결과를 거르는 조건이지 화면의 정체성이 아니라서다.
   * 대신 같은 주소로 히스토리 칸을 하나 만들어, 기기 뒤로가기가 필터를 닫게 한다.
   */
  test("필터는 주소를 바꾸지 않고 칸을 만들어 기기 뒤로가기로 닫힌다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
    const listUrl = page.url();
    const listIndex = await historyIndex(page);

    await searchFilterChip(page).click();
    await expect(filterApplyButton(page)).toBeVisible();
    expect(page.url(), "필터를 열어도 주소는 그대로다").toBe(listUrl);
    expect(await historyIndex(page), "필터는 칸을 하나 만든다").toBe(
      listIndex + 1,
    );

    await page.goBack();
    await expect(filterApplyButton(page)).toBeHidden();
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
    expect(page.url()).toBe(listUrl);
    expect(await historyIndex(page)).toBe(listIndex);
  });

  /**
   * 앱 안에서 닫을 때도 필터의 칸을 되감아야 한다. 칸을 남겨 두면 그 뒤 기기
   * 뒤로가기가 같은 결과 화면에서 한 번 헛걸음한다.
   */
  test("필터를 적용하면 필터의 칸을 되감는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    const listIndex = await historyIndex(page);

    await searchFilterChip(page).click();
    await expect(filterApplyButton(page)).toBeVisible();

    await filterApplyButton(page).click();
    await expect(filterApplyButton(page)).toBeHidden();
    expect(await historyIndex(page)).toBe(listIndex);
  });

  /**
   * 검색 입력 오버레이도 주소를 바꾸지 않고 칸을 하나 만든다. 그래서 기기 뒤로가기가
   * 오버레이를 닫는다.
   */
  test("검색 오버레이는 칸을 만들어 기기 뒤로가기로 닫힌다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    const homeIndex = await historyIndex(page);

    await openSearchOverlay(page);
    expect(new URL(page.url()).pathname).toBe("/");
    expect(await historyIndex(page)).toBe(homeIndex + 1);

    await page.goBack();
    await expect(overlaySearchInput(page)).toBeHidden();
    expect(await historyIndex(page)).toBe(homeIndex);
  });

  /**
   * 오버레이에서 검색하면 오버레이의 칸을 먼저 되감고 검색 결과로 간다. 오버레이 칸
   * 위에 쌓으면 검색 결과에서 뒤로 갈 때 닫았던 오버레이가 다시 열린다.
   */
  test("오버레이에서 검색하면 검색 결과가 홈 바로 위에 놓인다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    const homeIndex = await historyIndex(page);

    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
    expect(await historyIndex(page)).toBe(homeIndex + 1);

    await page.goBack();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(overlaySearchInput(page)).toBeHidden();
  });

  /** 길찾기 팝업도 칸을 하나 만들어, 기기 뒤로가기가 팝업만 닫고 상세는 남긴다. */
  test("길찾기 팝업은 기기 뒤로가기로 닫히고 상세는 남는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await page.getByText(searchItemRaw.lockerName).first().click();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();
    const detailIndex = await historyIndex(page);

    await page.getByRole("button", { name: "길찾기" }).click();
    await expect(page.getByText("어떤 지도로 길찾기 할까요?")).toBeVisible();
    expect(await historyIndex(page)).toBe(detailIndex + 1);

    await page.goBack();
    await expect(page.getByText("어떤 지도로 길찾기 할까요?")).toBeHidden();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();
    expect(await lockerPath(page)).not.toBeNull();
    expect(await historyIndex(page)).toBe(detailIndex);
  });
});
