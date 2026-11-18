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
/** 검색 결과 위에서 다시 검색할 때 쓰는 다른 검색어. */
const SECOND_KEYWORD = "역삼역";

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

/**
 * 자동완성의 장소 항목. 고르면 검색에서 연 장소 목록으로 바로 간다. 검색어는 장소
 * 이름으로 바뀌므로 입력한 검색어와 다른 이름을 둔다.
 */
const suggestPlaceRaw = {
  type: "PLACE",
  placeId: 900,
  placeName: "강남역 1번 출구",
  lockerId: null,
  lockerName: null,
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
      ? { count: 2, items: [suggestItemRaw, suggestPlaceRaw] }
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

/**
 * 검색 오버레이 왼쪽 위의 앱 안 닫기 버튼.
 *
 * 검색 결과 위에서는 검색 바에도 "닫기" 버튼이 있어서, 오버레이 입력이 든 헤더 안으로 좁힌다.
 */
const overlayCloseButton = (page: Page) =>
  page
    .locator("header")
    .filter({ has: overlaySearchInput(page) })
    .getByRole("button", { name: "닫기", exact: true });

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
    await expect.poll(() => historyIndex(page)).toBe(listIndex);
  });

  /**
   * 주소창을 복사해 받은 링크에는 보낸 사람의 검색어(`q`)가 붙어 있을 수 있다. 앱 안에서
   * 온 표시가 없는 칸이면 그 검색어를 걷어 내고 지도에서 연 화면으로 다룬다. 받은
   * 사람의 검색창에 남의 검색어가 뜨거나, 되돌아가기가 남의 검색 결과를 열지 않는다.
   */
  test("검색어가 붙은 상세 링크로 들어오면 검색어를 걷고 닫으면 홈으로 간다", async ({
    page,
  }) => {
    await page.goto(`/lockers/${LOCKER_ID}?q=${encodeURIComponent(KEYWORD)}`);
    await waitForMapReady(page);

    await expect.poll(() => queryParam(page, "q")).toBeNull();
    await expect.poll(() => lockerPath(page)).not.toBeNull();
    await expect(page.getByText(lockerDetailRaw.detailInfo)).toBeVisible();
    await expect(homeSearchBar(page)).toHaveValue("");

    await page.getByRole("button", { name: "닫기" }).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(page.getByText(searchItemRaw.lockerName)).toHaveCount(0);
  });

  test("검색어가 붙은 장소 목록 링크로 들어오면 검색어를 걷고 되돌아가기는 홈으로 간다", async ({
    page,
  }) => {
    await page.goto(`/places/${searchItemRaw.placeId}?q=${encodeURIComponent(KEYWORD)}`);
    await waitForMapReady(page);

    await expect.poll(() => queryParam(page, "q")).toBeNull();
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(`/places/${searchItemRaw.placeId}`);
    await expect(homeSearchBar(page)).not.toHaveValue(KEYWORD);

    await searchBarBackButton(page).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(searchBarBackButton(page)).toBeHidden();
  });

  /**
   * 앱 안에서 검색해 연 상세는 표시가 있어 검색어가 남는다. 새로고침해도 히스토리 칸의
   * 표시가 그대로라 검색 맥락을 잃지 않는다.
   *
   * 상세를 연 직후, 상세 응답이 오기 전에 새로고침하는 순서로 고정한다. 주소에 이름을
   * 붙이던 때는 응답을 받은 뒤 주소를 고쳐 썼고, 그 고쳐 쓰기가 새로고침 도중에 끼면
   * 브라우저가 칸의 표시를 버려 검색어까지 걷혔다. 상세 응답과 새로고침 문서를 늦춘다.
   */
  test("앱 안에서 검색해 연 상세는 응답 전에 새로고침해도 검색어가 남는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);

    /*
     * 순서를 시간이 아니라 요청으로 묶는다.
     * 1. 첫 상세 요청은 새로고침 문서 요청이 나갈 때까지 답하지 않는다.
     * 2. 새로고침 문서는 이전 문서가 상세 응답을 받은 뒤에 보낸다.
     * 그러면 상세 응답은 언제나 "새로고침이 시작된 뒤, 새 문서가 오기 전" 에 닿는다.
     */
    let markReloadRequested = () => {};
    const reloadRequested = new Promise<void>((resolve) => {
      markReloadRequested = resolve;
    });
    let markDetailAnswered = () => {};
    const detailAnswered = new Promise<void>((resolve) => {
      markDetailAnswered = resolve;
    });
    let isFirstDetailRequest = true;

    await page.route(`**/api/v1/lockers/${LOCKER_ID}*`, async (route) => {
      if (!isFirstDetailRequest) return route.fallback();
      isFirstDetailRequest = false;
      await reloadRequested;
      await route.fallback();
    });
    page.on("response", (response) => {
      if (response.url().includes(`/api/v1/lockers/${LOCKER_ID}`)) {
        markDetailAnswered();
      }
    });
    await page.route("**/lockers/**", async (route) => {
      if (route.request().resourceType() !== "document") {
        return route.fallback();
      }
      markReloadRequested();
      await detailAnswered;
      await route.fallback();
    });

    await page.getByText(searchItemRaw.lockerName).first().click();
    await expect.poll(() => lockerPath(page)).toBe(String(LOCKER_ID));
    await page.reload({ waitUntil: "commit" });
    await waitForMapReady(page);
    await expect(page.getByText(lockerDetailRaw.detailInfo)).toBeVisible();

    expect(
      await page.evaluate(
        () => (history.state as { mapBackTo?: string } | null)?.mapBackTo,
        ),
      "새로고침 뒤에도 칸의 표시가 남는다",
    ).toBeDefined();
    expect(await lockerPath(page)).toBe(String(LOCKER_ID));
    expect(await queryParam(page, "q")).toBe(KEYWORD);

    await page.goBack();
    await expect.poll(() => lockerPath(page)).toBeNull();
    await expect.poll(() => queryParam(page, "q")).toBe(KEYWORD);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
  });

  /**
   * 상세 주소는 id 만 쓴다. 이름을 붙이던 때는 상세 응답을 받은 뒤 주소를 고쳐 썼고,
   * 새로고침 도중 그 고쳐 쓰기가 끼면 칸의 표시가 사라졌다. 목록과 상세가 서로 다른
   * 이름을 내도 주소가 그대로인지 본다.
   */
  test("목록에서 연 상세 주소는 상세 응답을 받은 뒤에도 id 그대로다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);

    await page.getByText(searchItemRaw.lockerName).first().click();
    await expect.poll(() => lockerPath(page)).toBe(String(LOCKER_ID));
    await expect(page.getByText(lockerDetailRaw.detailInfo)).toBeVisible();
    await expect(page.getByText(lockerDetailRaw.lockerName).first()).toBeVisible();

    expect(await lockerPath(page)).toBe(String(LOCKER_ID));
    expect(await queryParam(page, "q")).toBe(KEYWORD);
  });

  test("이름이 붙은 예전 상세 주소는 id 경로로 영구 이동한다", async ({
    page,
  }) => {
    const response = await page.request.get(
      `/lockers/${LOCKER_ID}-${encodeURIComponent("예전-이름")}?q=${encodeURIComponent(KEYWORD)}`,
      { maxRedirects: 0 },
    );

    expect(response.status()).toBe(301);
    const location = new URL(
      response.headers().location ?? "",
      "http://localhost",
    );
    expect(location.pathname).toBe(`/lockers/${LOCKER_ID}`);
    expect(location.searchParams.get("q")).toBe(KEYWORD);
  });

  /**
   * 자동완성에서 항목을 고르면 검색창은 입력하던 글자가 아니라 고른 이름을 보인다.
   * 아래 깔린 검색 결과도 그 이름으로 맞춘다.
   */
  test("자동완성에서 보관함을 고르면 검색창이 고른 보관함 이름이 된다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await overlaySearchInput(page).fill("강남");
    await page.getByText(suggestItemRaw.lockerName).first().click();

    await expect.poll(() => lockerPath(page)).not.toBeNull();
    await expect
      .poll(() => queryParam(page, "q"))
      .toBe(suggestItemRaw.lockerName);
    await expect(homeSearchBar(page)).toHaveValue(suggestItemRaw.lockerName);
  });

  test("자동완성에서 장소를 고르면 검색창이 고른 장소 이름이 된다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await overlaySearchInput(page).fill("강남");
    await page.getByText(suggestPlaceRaw.placeName).first().click();

    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(`/places/${suggestPlaceRaw.placeId}`);
    await expect
      .poll(() => queryParam(page, "q"))
      .toBe(suggestPlaceRaw.placeName);
    await expect(homeSearchBar(page)).toHaveValue(suggestPlaceRaw.placeName);
  });

  /**
   * 자동완성으로 보관함을 고르면 최근 검색어에 입력하던 글자가 아니라 고른 이름을
   * 검색어로 남긴다. 그 최근 검색어를 다시 누르면 고른 이름으로 검색 맥락이 열린다.
   */
  test("자동완성으로 고른 보관함은 최근 검색어에서 다시 열어도 고른 이름이 검색어가 된다", async ({
    page,
  }) => {
    const TYPED = "강남";

    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await overlaySearchInput(page).fill(TYPED);
    await page.getByText(suggestItemRaw.lockerName).first().click();
    await expect.poll(() => lockerPath(page)).not.toBeNull();

    const savedDraft = await page.evaluate(() => {
      const raw = localStorage.getItem("search_history") ?? "[]";
      return (JSON.parse(raw) as Array<{ searchDraft?: string }>)[0]
        ?.searchDraft;
    });
    expect(savedDraft).toBe(suggestItemRaw.lockerName);

    // 새 문서로 홈에 들어와 최근 검색어만 남은 상태에서 다시 고른다.
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await page.getByText(suggestItemRaw.lockerName).first().click();

    await expect.poll(() => lockerPath(page)).not.toBeNull();
    await expect
      .poll(() => queryParam(page, "q"))
      .toBe(suggestItemRaw.lockerName);
    await expect(homeSearchBar(page)).toHaveValue(suggestItemRaw.lockerName);
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
   * 확정하지 않은 초안은 어느 길로 닫아도 남기지 않는다. 기기 뒤로가기는 원래
   * 남기지 않았고, 앱 안 닫기 버튼만 남겼다. 다시 열면 확정된 검색어만 보인다.
   */
  test("앱 안 닫기 버튼으로 닫아도 확정하지 않은 초안은 남지 않는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);

    await openSearchOverlay(page);
    await overlaySearchInput(page).fill(SECOND_KEYWORD);
    await overlayCloseButton(page).click();
    await expect(overlaySearchInput(page)).toBeHidden();

    await openSearchOverlay(page);
    await expect(overlaySearchInput(page)).toHaveValue("");
  });

  test("검색 결과 위에서 초안을 쓰다 닫으면 확정된 검색어로 돌아온다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();

    await openSearchOverlay(page);
    await overlaySearchInput(page).fill(SECOND_KEYWORD);
    await overlayCloseButton(page).click();
    await expect(overlaySearchInput(page)).toBeHidden();
    expect(await queryParam(page, "q")).toBe(KEYWORD);

    await openSearchOverlay(page);
    await expect(overlaySearchInput(page)).toHaveValue(KEYWORD);
  });

  /**
   * 홈에서 자동완성으로 장소를 고르면 검색 결과를 건너뛰고 장소 목록이 열린다. 떠나온
   * 칸이 홈이라 되돌아가기가 히스토리를 되감지 못하고, 검색창에 남은 글자로 검색
   * 결과를 연다. 초안이 남으면 한 번도 검색하지 않은 글자로 결과가 열린다.
   */
  test("자동완성으로 연 장소 목록에서 초안을 쓰다 닫고 되돌아가면 확정된 검색어로 결과가 열린다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await overlaySearchInput(page).fill(KEYWORD);
    await page.getByText(suggestPlaceRaw.placeName).first().click();
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(`/places/${suggestPlaceRaw.placeId}`);
    await expect
      .poll(() => queryParam(page, "q"))
      .toBe(suggestPlaceRaw.placeName);

    await openSearchOverlay(page);
    await overlaySearchInput(page).fill(SECOND_KEYWORD);
    await overlayCloseButton(page).click();
    await expect(overlaySearchInput(page)).toBeHidden();

    await searchBarBackButton(page).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/search");
    await expect
      .poll(() => queryParam(page, "q"))
      .toBe(suggestPlaceRaw.placeName);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
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

  /**
   * 검색 결과 위에서 다시 검색하면 결과 칸을 바꾸는 것이 맞다. 다만 오버레이 칸만
   * 되감고 바꾸면, 바꾸기는 앞쪽 칸을 지우지 않아 오버레이 칸이 남는다. 그러면
   * 앞으로가기가 이미 끝난 검색의 오버레이를 다시 연다.
   */
  test("검색 결과에서 다시 검색하면 앞으로가기로 지난 오버레이가 열리지 않는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    const homeIndex = await historyIndex(page);

    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();

    await openSearchOverlay(page);
    await submitSearch(page, SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();
    await expect.poll(() => historyIndex(page)).toBe(homeIndex + 1);

    await page.goForward();
    await expect.poll(() => queryParam(page, "q")).toBe(SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();

    await page.goBack();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  });

  /**
   * 시트 칸은 겹치지 않는다. 필터가 열린 채 오버레이를 열면 필터 칸을 되감고 연다.
   * 겹쳐 쌓으면 다시 검색한 뒤 앞으로가기가 지난 필터와 오버레이를 다시 열었다.
   */
  test("필터가 열린 채 오버레이를 열면 필터를 닫고 그 칸에 오버레이를 연다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    const homeIndex = await historyIndex(page);

    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await searchFilterChip(page).click();
    await expect(filterApplyButton(page)).toBeVisible();
    await expect.poll(() => historyIndex(page)).toBe(homeIndex + 2);

    await openSearchOverlay(page);
    await expect(filterApplyButton(page)).toBeHidden();
    await expect.poll(() => historyIndex(page)).toBe(homeIndex + 2);

    // 오버레이를 닫으면 필터 없이 결과 목록이 나온다.
    await page.goBack();
    await expect(overlaySearchInput(page)).toBeHidden();
    await expect(filterApplyButton(page)).toBeHidden();
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
    await expect.poll(() => historyIndex(page)).toBe(homeIndex + 1);

    await openSearchOverlay(page);
    await submitSearch(page, SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();
    await expect.poll(() => historyIndex(page)).toBe(homeIndex + 1);

    await page.goForward();
    await expect.poll(() => queryParam(page, "q")).toBe(SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();
    await expect(filterApplyButton(page)).toBeHidden();

    await page.goBack();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  });

  /**
   * 더 얕은 화면으로 가는 검색(장소 목록 → 검색 결과)도 같은 규칙을 따른다. 오버레이
   * 칸을 되감고 칸을 바꾸면 오버레이 칸이 앞쪽에 남는다.
   */
  test("장소 목록에서 다시 검색해도 앞으로가기로 지난 오버레이가 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(`/places/${searchItemRaw.placeId}?q=${encodeURIComponent(KEYWORD)}`);
    await waitForMapReady(page);
    const entryIndex = await historyIndex(page);

    await openSearchOverlay(page);
    await submitSearch(page, SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/search");

    await page.goForward();
    await expect.poll(() => queryParam(page, "q")).toBe(SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();

    await page.goBack();
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(`/places/${searchItemRaw.placeId}`);
    await expect.poll(() => historyIndex(page)).toBe(entryIndex);
    await expect(overlaySearchInput(page)).toBeHidden();
  });

  test("검색 결과로 바로 들어와 다시 검색해도 앞으로가기로 지난 오버레이가 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(`/search?q=${encodeURIComponent(KEYWORD)}`);
    await waitForMapReady(page);
    await expect(page.getByText(searchItemRaw.lockerName).first()).toBeVisible();
    const entryIndex = await historyIndex(page);

    await openSearchOverlay(page);
    await submitSearch(page, SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();

    await page.goForward();
    await expect.poll(() => queryParam(page, "q")).toBe(SECOND_KEYWORD);
    await expect(overlaySearchInput(page)).toBeHidden();

    // 되감을 부모가 없어 들어온 검색 결과 위에 새 결과가 한 칸 쌓인다.
    await page.goBack();
    await expect.poll(() => queryParam(page, "q")).toBe(KEYWORD);
    await expect.poll(() => historyIndex(page)).toBe(entryIndex);
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

  /**
   * 여러 칸을 한 번에 건너와도(브라우저 히스토리 메뉴, `history.go(2)`) 닿은 칸의 시트를
   * 연다. 아래 화면까지 바뀌는 이동이라, 화면을 맞추는 일과 시트를 여는 일이 같은
   * 렌더에서 겹친다.
   */
  test("여러 칸을 한 번에 앞으로 건너와도 필터가 다시 열린다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await searchFilterChip(page).click();
    await expect(filterApplyButton(page)).toBeVisible();

    await page.evaluate(() => history.go(-2));
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(filterApplyButton(page)).toBeHidden();
    // 필터를 닫으며 목록으로 되돌리면 홈 위에 결과 목록 시트가 남는다.
    await expect(page.getByText(searchItemRaw.lockerName)).toHaveCount(0);

    await page.evaluate(() => history.go(2));
    await expect.poll(() => queryParam(page, "q")).toBe(KEYWORD);
    await expect(filterApplyButton(page)).toBeVisible();
  });

  test("여러 칸을 한 번에 앞으로 건너와도 상세 위 길찾기 팝업이 다시 열린다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await openSearchOverlay(page);
    await submitSearch(page, KEYWORD);
    await page.getByText(searchItemRaw.lockerName).first().click();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();
    await page.getByRole("button", { name: "길찾기" }).click();
    await expect(page.getByText("어떤 지도로 길찾기 할까요?")).toBeVisible();

    await page.evaluate(() => history.go(-2));
    await expect.poll(() => lockerPath(page)).toBeNull();
    await expect(page.getByText("어떤 지도로 길찾기 할까요?")).toBeHidden();

    await page.evaluate(() => history.go(2));
    await expect.poll(() => lockerPath(page)).not.toBeNull();
    await expect(page.getByText("어떤 지도로 길찾기 할까요?")).toBeVisible();
  });
});
