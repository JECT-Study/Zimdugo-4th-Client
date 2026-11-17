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

/**
 * 지금 히스토리 칸의 위치. 앞에서부터 몇 번째 칸인지다.
 *
 * `history.length` 는 앞으로가기로 갈 칸까지 센다. 상세를 열었다 뒤로 닫으면 위치는
 * 제자리인데 길이는 하나 늘어난 채로 남아, "뒤로가기를 몇 번 눌러야 하나" 를 재지
 * 못한다. 라우터가 칸마다 적는 위치를 읽는다.
 */
const historyIndex = (page: Page) =>
  page.evaluate(
    () => (history.state as { __TSR_index?: number } | null)?.__TSR_index ?? 0,
  );

/** 마커들의 화면 자리. 카메라가 움직이면 함께 움직인다. */
const markerPositions = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".map-marker-offset-wrapper")].map((marker) => {
      const box = marker.getBoundingClientRect();
      return `${Math.round(box.x)},${Math.round(box.y)}`;
    }),
  );

/** 주소가 가리키는 보관함 상세. 상세는 `/lockers/<slug>` 경로로 나타난다. */
const lockerPath = (page: Page) =>
  page.evaluate(
    () => location.pathname.match(/^\/lockers\/([^/]+)$/)?.[1] ?? null,
  );

/*
 * 화면 문구("닫기", "길찾기")로 요소를 찾으므로 언어를 고정한다. 기기 기본값(영어)이면
 * 서버가 보관함 경로를 `/en/lockers/…` 로 보내 다른 문구가 뜬다. 홈(`/`)은 프리렌더된
 * 한국어 파일이 바로 응답해 이 판정을 거치지 않던 것이라 그동안 드러나지 않았다.
 */
test.use({ locale: "ko-KR" });

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

/**
 * 상세는 경로(`/lockers/<slug>`)로 나타나지만 화면은 여전히 홈 하나다. 경로가 바뀔
 * 때 화면이나 지도가 다시 만들어지면 카메라·시트 상태를 잃는다.
 */
test.describe("보관함 상세 주소", () => {
  test("상세를 여닫아도 지도를 다시 만들지 않는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    // 지금 지도 노드에 표시를 남긴다. 다시 만들어지면 새 노드에는 표시가 없다.
    await page.evaluate(() => {
      const map = document.querySelector("[data-map-state]");
      if (map) (map as HTMLElement & { __probe?: true }).__probe = true;
    });

    await pressMarker(page, 0);
    await expect.poll(() => lockerPath(page)).not.toBeNull();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();

    await pressCloseButton(page);
    await expect.poll(() => lockerPath(page)).toBeNull();

    expect(
      await page.evaluate(
        () =>
          (
            document.querySelector("[data-map-state]") as
              | (HTMLElement & { __probe?: true })
              | null
          )?.__probe === true,
      ),
      "상세 경로를 오가는 동안 지도가 다시 만들어졌다",
    ).toBe(true);
  });

  /**
   * 낮은 배율에서 핀을 누르면 핀이 커지는 애니메이션을 기다린 뒤 시트를 연다. 주소는
   * 먼저 상세가 된다. 그 사이에 뒤로 가면 시트는 아직 열리지 않았으므로, 예약된 열기를
   * 따로 취소하지 않으면 뒤늦게 홈 위에 상세가 뜬다.
   */
  test("상세가 열리기를 기다리는 동안 뒤로 가면 상세가 뜨지 않는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    await pressMarker(page, 0);
    await expect.poll(() => lockerPath(page)).not.toBeNull();
    await page.goBack();
    await expect.poll(() => lockerPath(page)).toBeNull();

    // 애니메이션 대기(840ms)보다 길게 기다린 뒤에도 상세가 없어야 한다.
    await page.waitForTimeout(1_500);
    await expect(page.getByRole("button", { name: "길찾기" })).toHaveCount(0);
  });

  test("구 주소 ?locker= 로 들어오면 보관함 경로에서 상세가 뜬다", async ({
    page,
  }) => {
    await page.goto(`/?locker=${LOCKER_ID}`);
    await waitForMapReady(page);

    await expect.poll(() => lockerPath(page)).not.toBeNull();
    expect(new URL(page.url()).searchParams.get("locker")).toBeNull();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();
  });

  test("구 딥링크 ?openLockerId= 로 들어오면 보관함 경로에서 상세가 뜬다", async ({
    page,
  }) => {
    await page.goto(`/?openLockerId=${LOCKER_ID}`);
    await waitForMapReady(page);

    await expect.poll(() => lockerPath(page)).not.toBeNull();
    expect(new URL(page.url()).searchParams.get("openLockerId")).toBeNull();
    await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();
  });
});

test.describe("홈 화면과 브라우저 히스토리", () => {
  test("상세 시트를 여닫아도 히스토리가 늘지 않는다", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(0);

    const baseline = await historyIndex(page);

    for (let round = 0; round < 3; round += 1) {
      await pressMarker(page, 0);
      await expect.poll(() => lockerPath(page)).not.toBeNull();

      await pressCloseButton(page);
      await expect.poll(() => lockerPath(page)).toBeNull();
      // 시트 닫힘 애니메이션이 끝나고 마커가 기본 상태로 돌아와야 다시 눌린다.
      await page.waitForTimeout(1_000);
    }

    expect(
      await historyIndex(page),
      "상세를 여닫을 때마다 히스토리가 쌓이면 뒤로가기를 그만큼 더 눌러야 한다",
    ).toBe(baseline);
  });

  test("상세를 연 채 다른 핀을 눌러도 히스토리가 늘지 않는다", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect
      .poll(() => page.locator(".map-marker-offset-wrapper").count())
      .toBeGreaterThan(1);

    await pressMarker(page, 0);
    await expect.poll(() => lockerPath(page)).not.toBeNull();

    const baseline = await historyIndex(page);
    const before = await markerPositions(page);

    for (let round = 0; round < 3; round += 1) {
      await pressMarker(page, (round + 1) % 2);
      await page.waitForTimeout(700);
    }

    // 탭이 가로막혀 아무 일도 없었다면 히스토리는 어차피 그대로라, 눌린 것을
    // 확인하지 않으면 이 테스트는 늘 통과한다. 핀을 고르면 카메라가 그 핀으로
    // 옮겨가므로 마커 자리가 달라진다.
    expect(
      await markerPositions(page),
      "핀이 눌리지 않아 아무 일도 일어나지 않았다",
    ).not.toEqual(before);

    expect(
      await historyIndex(page),
      "핀을 고를 때마다 쌓이면 뒤로가기를 그만큼 더 눌러야 한다",
    ).toBe(baseline);
  });
});
